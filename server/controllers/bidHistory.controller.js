const bidHistoryService = require("../services/bidHistory.service");

/**
 * GET /bid-history
 * Lấy tất cả lịch sử đấu giá (có phân trang)
 */
const getAllBidHistory = async (req, res) => {
  const { page = 1, limit = 20, productId, userId } = req.query;

  try {
    const result = await bidHistoryService.getAllBidHistory({
      page: parseInt(page),
      limit: parseInt(limit),
      productId: productId ? parseInt(productId) : undefined,
      userId: userId ? parseInt(userId) : undefined,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /bid-history/:id
 * Lấy một bản ghi lịch sử đấu giá theo ID
 */
const getBidHistoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const bidHistory = await bidHistoryService.getBidHistoryById(id);
    res.json(bidHistory);
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid bid history ID") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Bid history not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /bid-history/product/:productId
 * Lấy lịch sử đấu giá theo sản phẩm (2.3)
 */
const getBidHistoryByProduct = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 20, order = "desc" } = req.query;

  try {
    const result = await bidHistoryService.getBidHistoryByProduct(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      order: order.toLowerCase() === "asc" ? "asc" : "desc",
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid product ID") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Product not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /bid-history/user/:userId
 * Lấy lịch sử đấu giá theo người dùng
 */
const getBidHistoryByUser = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, order = "desc" } = req.query;

  try {
    const result = await bidHistoryService.getBidHistoryByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      order: order.toLowerCase() === "asc" ? "asc" : "desc",
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid user ID") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /bid-history
 * Tạo một bản ghi lịch sử đấu giá mới
 */
const createBidHistory = async (req, res) => {
  const { product_id, user_id, bid_price } = req.body;

  if (!product_id || !user_id || !bid_price) {
    return res.status(400).json({
      message: "Product ID, User ID, and Bid Price are required",
    });
  }

  try {
    const newBidHistory = await bidHistoryService.createBidHistory({
      product_id: parseInt(product_id),
      user_id: parseInt(user_id),
      bid_price: BigInt(bid_price),
    });
    res.status(201).json(newBidHistory);
  } catch (err) {
    console.error(err);
    if (err.message === "Product not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Invalid bid price") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /bid-history/:id
 * Xóa một bản ghi lịch sử đấu giá
 */
const deleteBidHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await bidHistoryService.deleteBidHistory(id);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid bid history ID") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Bid history not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllBidHistory,
  getBidHistoryById,
  getBidHistoryByProduct,
  getBidHistoryByUser,
  createBidHistory,
  deleteBidHistory,
};
