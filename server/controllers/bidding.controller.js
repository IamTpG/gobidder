const biddingService = require("../services/bidding.service");

// Đặt giá
const placeBid = async (req, res) => {
  const { id: productId } = req.params;
  const { maxPrice } = req.body;
  const userId = req.user.id; // Lấy từ middleware isAuth

  if (!maxPrice) {
    return res.status(400).json({ message: "Max price is required" });
  }

  // Validate decimal places
  const strPrice = maxPrice.toString();
  if (strPrice.includes(".") && strPrice.split(".")[1].length > 2) {
    return res
      .status(400)
      .json({ message: "Bid amount cannot have more than 2 decimal places" });
  }

  try {
    const result = await biddingService.placeAutoBid(
      userId,
      productId,
      maxPrice
    );

    // Gửi email thông báo (Async)
    const { notificationData } = result;
    if (notificationData) {
      (async () => {
        try {
          const { productName, newPrice, sellerId, newWinnerId, oldWinnerId } =
            notificationData;
          const prisma = require("../config/prisma");
          const { sendMail } = require("../utils/utils");

          // 1. Fetch info
          // Seller
          const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { email: true, full_name: true },
          });
          // The Bidder (User who just performed the action)
          const currentBidder = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, full_name: true },
          });

          // 2. Email to Seller
          if (seller?.email) {
            await sendMail({
              to: seller.email,
              subject: `New Bid on "${productName}"`,
              text: `A new bid of ${newPrice} has been placed on "${productName}".`,
              html: `<p>Hello <strong>${seller.full_name}</strong>,</p>
                     <p>A new bid of <strong>${newPrice}</strong> has been placed on your product <strong>${productName}</strong>.</p>`,
            });
          }

          // 3. Email to The Bidder (Confirming their action)
          if (currentBidder?.email) {
            const isWinning = newWinnerId === userId;
            const statusMsg = isWinning
              ? "You are currently the highest bidder!"
              : "You are NOT the highest bidder (auto-bid exceeded).";

            await sendMail({
              to: currentBidder.email,
              subject: `Bid Placed: "${productName}"`,
              text: `Your bid on "${productName}" was successful. Current price: ${newPrice}. ${statusMsg}`,
              html: `<p>Hello <strong>${currentBidder.full_name}</strong>,</p>
                     <p>You successfully placed a bid on <strong>${productName}</strong>.</p>
                     <p><strong>Current Price:</strong> ${newPrice}</p>
                     <p><strong>Status:</strong> ${statusMsg}</p>`,
            });
          }

          // 4. Email to Previous Winner (Outbid Alert)
          // Only if there WAS a previous winner, and they are NOT the new winner (they lost lead), and they are NOT the current bidder (logic redundancy check).
          if (
            oldWinnerId &&
            oldWinnerId !== newWinnerId &&
            oldWinnerId !== userId
          ) {
            const oldWinner = await prisma.user.findUnique({
              where: { id: oldWinnerId },
              select: { email: true, full_name: true },
            });
            if (oldWinner?.email) {
              await sendMail({
                to: oldWinner.email,
                subject: `You have been outbid on "${productName}"`,
                text: `You have been outbid on "${productName}". The new price is ${newPrice}.`,
                html: `<p>Hello <strong>${oldWinner.full_name}</strong>,</p>
                       <p>You have been outbid on <strong>${productName}</strong>.</p>
                       <p>The new price is <strong>${newPrice}</strong>.</p>
                       <p><a href="${process.env.FE_URL}/products/${productId}">Place a new bid</a> to reclaim the lead!</p>`,
              });
            }
          }
        } catch (err) {
          console.error("Failed to send notification emails:", err);
        }
      })();
    }

    // Gửi Socket.io event ở đây để update realtime cho client khác
    // io.to(productId).emit('new_bid', result);

    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes("Bid must be at least") ||
      error.message === "Auction has ended"
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Bidding Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  placeBid,
};
