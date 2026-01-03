const watchlistService = require("../services/watchlist.service");

// Get user's watchlist
const getUserWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const watchlist = await watchlistService.getUserWatchlist(userId);

    return res.status(200).json({
      data: watchlist,
      count: watchlist.length,
    });
  } catch (error) {
    console.error("Error in getUserWatchlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Add product to watchlist
const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = parseInt(req.params.productId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await watchlistService.addToWatchlist(userId, productId);

    return res.status(201).json({
      message: "Added to watchlist successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in addToWatchlist:", error);
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Product already in watchlist") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Remove product from watchlist
const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = parseInt(req.params.productId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await watchlistService.removeFromWatchlist(
      userId,
      productId,
    );

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error in removeFromWatchlist:", error);
    if (error.message === "Product not in watchlist") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Check if product is in watchlist
const checkWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = parseInt(req.params.productId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const isInWatchlist = await watchlistService.isInWatchlist(
      userId,
      productId,
    );

    return res.status(200).json({
      isInWatchlist,
    });
  } catch (error) {
    console.error("Error in checkWatchlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle watchlist status
const toggleWatchlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = parseInt(req.params.productId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await watchlistService.toggleWatchlist(userId, productId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in toggleWatchlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
  toggleWatchlist,
};
