const prisma = require("../config/prisma");
const bannedBidderService = require("./bannedBidder.service");

const { sendMail } = require("../utils/utils");

/**
 * Đặt giá tự động (Auto Bidding)
 * @param {Int} userId - ID người đặt giá
 * @param {Int} productId - ID sản phẩm
 * @param {Number} inputMaxPrice - Giá trần người dùng chấp nhận trả
 */
const placeAutoBid = async (userId, productId, inputMaxPrice) => {
  const maxPrice = Number(inputMaxPrice);

  // Check if user is banned from this product first
  const isBanned = await bannedBidderService.isBidderBanned(
    parseInt(productId),
    userId
  );

  if (isBanned) {
    throw new Error(
      "You are banned from bidding on this product by the seller"
    );
  }

  // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu (Race condition)
  const result = await prisma.$transaction(async (tx) => {
    // Lấy thông tin sản phẩm và người bán/người giữ giá hiện tại
    const product = await tx.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        seller: true,
        current_bidder: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.seller_id === userId) {
      throw new Error("Seller cannot bid on their own product");
    }

    if (new Date() > product.end_time) {
      throw new Error("Auction has ended");
    }

    // Kiểm tra giá sàn hợp lệ (Phải lớn hơn giá hiện tại + bước giá)
    // Lưu ý: Nếu chưa có ai đặt, giá phải >= giá khởi điểm
    const minRequiredPrice =
      product.current_price === 0n
        ? product.start_price
        : product.current_price + product.step_price;

    // Note: Vẫn cho winner update giá trần nhưng max_price > current_price + step_price
    if (maxPrice < minRequiredPrice) {
      throw new Error(`Bid must be at least ${minRequiredPrice.toString()}`);
    }

    // Capture previous bidder details before update
    const previousBidder = product.current_bidder;

    // Lưu hoặc Cập nhật AutoBid của User (Upsert)
    // Cần lấy luôn thông tin User để gửi email
    const bidder = await tx.user.findUnique({ where: { id: userId } });
    if (!bidder) throw new Error("Bidder not found");

    await tx.autoBid.upsert({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: parseInt(productId),
        },
      },
      update: {
        max_price: maxPrice,
        created_at: new Date(), // Cập nhật thời gian để xét ưu tiên
      },
      create: {
        user_id: userId,
        product_id: parseInt(productId),
        max_price: maxPrice,
      },
    });

    // Thuật toán đấu giá
    // Lấy Top 2 người có giá trần cao nhất
    const topBids = await tx.autoBid.findMany({
      where: { product_id: parseInt(productId) },
      orderBy: [
        { max_price: "desc" },
        { created_at: "asc" }, // Ai đặt giá đó sớm hơn thì thắng (nếu bằng giá)
      ],
      take: 2,
    });

    let newCurrentPrice = product.current_price;
    let winnerId = null;

    // Trường hợp 1: Chỉ có 1 người đấu giá (Chính là người vừa đặt)
    if (topBids.length === 1) {
      const myBid = topBids[0];
      winnerId = myBid.user_id;

      // Nếu trước đó chưa có giá, set bằng giá khởi điểm
      // Nếu đã có giá (do người này tự tăng max_price), giữ nguyên giá hiện tại
      if (product.bid_count === 0) {
        newCurrentPrice = product.start_price;
      }
    }
    // Trường hợp 2: Có đối thủ cạnh tranh
    else {
      const winnerBid = topBids[0];
      const secondBid = topBids[1];

      winnerId = winnerBid.user_id;

      // Logic tính giá: Giá của người thứ 2 + Bước giá
      const calculatedPrice =
        userId === winnerBid.user_id
          ? secondBid.max_price + product.step_price
          : secondBid.max_price;

      // Giá mới không được vượt quá giá trần của người thắng
      if (calculatedPrice > winnerBid.max_price) {
        newCurrentPrice = winnerBid.max_price;
      } else {
        newCurrentPrice = calculatedPrice;
      }
    }

    // Xử lý tự động gia hạn (Anti-sniping)
    // Read system config so admins can control trigger and extension values.
    const cfg = (await tx.systemConfig.findFirst({ where: { id: 1 } })) || {};
    // fallback defaults keep previous behavior: trigger 5 (minutes), extension 10 (minutes)
    const triggerMinutes =
      typeof cfg.anti_sniping_trigger === "number"
        ? cfg.anti_sniping_trigger
        : 5;
    const extensionMinutes =
      typeof cfg.anti_sniping_extension === "number"
        ? cfg.anti_sniping_extension
        : 10;

    const now = new Date();
    const timeRemaining = product.end_time.getTime() - now.getTime();
    let newEndTime = product.end_time;
    let isExtended = false;

    const triggerMs = triggerMinutes * 60 * 1000;
    const extensionMs = extensionMinutes * 60 * 1000;

    if (timeRemaining > 0 && timeRemaining <= triggerMs) {
      newEndTime = new Date(product.end_time.getTime() + extensionMs);
      isExtended = true;
    }

    // Cập nhật Product
    // Chỉ update nếu giá thay đổi HOẶC người thắng thay đổi HOẶC có gia hạn
    let priceUpdated = false;
    if (
      newCurrentPrice > product.current_price ||
      product.current_bidder_id !== winnerId ||
      isExtended
    ) {
      await tx.product.update({
        where: { id: parseInt(productId) },
        data: {
          current_price: newCurrentPrice,
          current_bidder_id: winnerId,
          bid_count: { increment: 1 }, // Tăng số lượt bid
          end_time: newEndTime,
        },
      });
      priceUpdated = true;

      // Ghi lịch sử (Chỉ ghi giá công khai)
      // Chỉ ghi nếu có sự thay đổi về giá
      if (newCurrentPrice > product.current_price || product.bid_count === 0) {
        await tx.bidHistory.create({
          data: {
            product_id: parseInt(productId),
            user_id: winnerId,
            bid_price: newCurrentPrice,
          },
        });
      }
    }

    // Return data needed for emails
    // We only send emails if priceUpdated is true (transaction occurred)
    // Or strictly based on requirements: "khi ra giá thành công, giá sản phẩm được cập nhật" -> imply priceUpdated
    return {
      message: "Bid placed successfully",
      currentPrice: newCurrentPrice.toString(),
      winnerId: winnerId,
      isExtended: isExtended,
      emailData: priceUpdated
        ? {
            shouldSend: true,
            productName: product.name,
            sellerEmail: product.seller.email,
            sellerName: product.seller.full_name,
            bidderEmail: bidder.email, // Người đang đặt giá
            bidderName: bidder.full_name,
            newPrice: newCurrentPrice.toString(),
            previousBidderEmail: previousBidder?.email,
            previousBidderName: previousBidder?.full_name,
            previousBidderId: previousBidder?.id,
            newWinnerId: winnerId,
          }
        : null,
    };
  });

  // Handle Emails outside transaction
  if (result.emailData && result.emailData.shouldSend) {
    const {
      productName,
      sellerEmail,
      sellerName,
      bidderEmail,
      bidderName,
      newPrice,
      previousBidderEmail,
      previousBidderName,
      previousBidderId,
      newWinnerId,
    } = result.emailData;

    // 1. Send email to Seller
    sendMail({
      to: sellerEmail,
      subject: `New Bid on "${productName}"`,
      text: `Hello ${sellerName},\n\nA new bid has been placed on your product "${productName}".\nCurrent Price: ${newPrice}\n\nCheck it out!`,
      html: `<p>Hello <strong>${sellerName}</strong>,</p><p>A new bid has been placed on your product "<strong>${productName}</strong>".</p><p>Current Price: <strong>${newPrice}</strong></p>`,
    }).catch(console.error);

    // 2. Send email to Bidder (The one who just placed the bid)
    sendMail({
      to: bidderEmail,
      subject: `Bid Successful: "${productName}"`,
      text: `Hello ${bidderName},\n\nYou have successfully placed a bid on "${productName}".\nCurrent Price: ${newPrice}`,
      html: `<p>Hello <strong>${bidderName}</strong>,</p><p>You have successfully placed a bid on "<strong>${productName}</strong>".</p><p>Current Price: <strong>${newPrice}</strong></p>`,
    }).catch(console.error);

    // 3. Send email to Previous Bidder (if they were outbid)
    // Only if previous bidder exists AND is NOT the new winner (meaning lost)
    // AND is NOT the person who just bid (already handled above)
    if (previousBidderEmail && previousBidderId !== newWinnerId) {
      sendMail({
        to: previousBidderEmail,
        subject: `You have been outbid on "${productName}"`,
        text: `Hello ${previousBidderName},\n\nSomeone has placed a higher bid on "${productName}".\nCurrent Price: ${newPrice}\n\nPlace a new bid to reclaim your potential win!`,
        html: `<p>Hello <strong>${previousBidderName}</strong>,</p><p>Someone has placed a higher bid on "<strong>${productName}</strong>".</p><p>Current Price: <strong>${newPrice}</strong></p><p><a href="${process.env.CLIENT_URL || "#"}">Place a new bid now!</a></p>`,
      }).catch(console.error);
    }
  }

  return result;
};

module.exports = {
  placeAutoBid,
};
