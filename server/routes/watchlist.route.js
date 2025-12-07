const express = require("express");
const passport = require("passport");
const watchlistController = require("../controllers/watchlist.controller");

const router = express.Router();

// All routes require authentication
router.use(passport.authenticate("jwt", { session: false }));

// Get user's watchlist
router.get("/", watchlistController.getUserWatchlist);

// Check if product is in watchlist
router.get("/:productId/check", watchlistController.checkWatchlist);

// Toggle watchlist status (add/remove)
router.post("/:productId/toggle", watchlistController.toggleWatchlist);

// Add product to watchlist
router.post("/:productId", watchlistController.addToWatchlist);

// Remove product from watchlist
router.delete("/:productId", watchlistController.removeFromWatchlist);

module.exports = router;
