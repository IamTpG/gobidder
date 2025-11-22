const biddingService = require("../services/bidding.service");

// Đặt giá
const placeBid = async (req, res) => {
  const { id: productId } = req.params;
  const { maxPrice } = req.body;
  const userId = req.user.id; // Lấy từ middleware isAuth

  if (!maxPrice) {
    return res.status(400).json({ message: "Max price is required" });
  }

  try {
    const result = await biddingService.placeAutoBid(
      userId,
      productId,
      maxPrice,
    );

    // Không yêu cầu chức năng realtime, không cần cài đặt Socket.io
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
