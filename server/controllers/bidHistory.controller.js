const bidHistoryService = require("../services/bidHistory.service");

// Lấy lịch sử đặt giá theo sản phẩm
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

// Lấy lịch sử đấu giá cá nhân
const getBidHistoryByUser = async (req, res) => {
  // req.user đã có sẵn nhờ Passport verify thành công trước đó
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

// Lấy giá trần cá nhân đã đặt cho sản phẩm
const getAutoBidProductByUser = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const result = await bidHistoryService.getAutoBidProductByUser(
      userId,
      productId,
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả lịch sử đấu giá
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

// Lấy một lịch sử đấu giá theo ID
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

// Tạo một lịch sử đấu giá mới
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

// Xóa một bản ghi lịch sử đấu giá
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
  getAutoBidProductByUser,
  createBidHistory,
  deleteBidHistory,
};
