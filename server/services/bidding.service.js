const prisma = require("../config/prisma");

/**
 * Đặt giá tự động (Auto Bidding)
 * @param {Int} userId - ID người đặt giá
 * @param {Int} productId - ID sản phẩm
 * @param {BigInt} inputMaxPrice - Giá trần người dùng chấp nhận trả
 */
const placeAutoBid = async (userId, productId, inputMaxPrice) => {
  const maxPrice = BigInt(inputMaxPrice);

  // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu (Race condition)
  return await prisma.$transaction(async (tx) => {
    // Lấy thông tin sản phẩm
    const product = await tx.product.findUnique({
      where: { id: parseInt(productId) },
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

    // Lưu hoặc Cập nhật AutoBid của User (Upsert)
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
    const triggerMinutes = typeof cfg.anti_sniping_trigger === 'number' ? cfg.anti_sniping_trigger : 5;
    const extensionMinutes = typeof cfg.anti_sniping_extension === 'number' ? cfg.anti_sniping_extension : 10;

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

    return {
      message: "Bid placed successfully",
      currentPrice: newCurrentPrice.toString(),
      winnerId: winnerId,
      isExtended: isExtended,
    };
  });
};

module.exports = {
  placeAutoBid,
};
