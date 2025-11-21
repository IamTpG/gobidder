const express = require("express");
const passport = require("passport");

const {
  getAllBidHistory,
  getBidHistoryById,
  getBidHistoryByProduct,
  getBidHistoryByUser,
  createBidHistory,
  deleteBidHistory,
} = require("../controllers/bidHistory.controller");

const router = express.Router();

// GET all bid history (với filter)
// router.get("/", getAllBidHistory);

// GET bid history theo product
router.get("/product/:productId", getBidHistoryByProduct);

// GET bid history theo user
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  getBidHistoryByUser,
);

// GET bid history theo ID
// router.get("/:id", getBidHistoryById);

// POST tạo bid history mới
// Phu
// router.post("/", createBidHistory);

// DELETE xóa bid history
// Minh
// router.delete("/:id", deleteBidHistory);

module.exports = router;
