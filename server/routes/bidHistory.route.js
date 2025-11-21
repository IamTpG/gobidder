const express = require("express");
const passport = require("passport");

const bidHistoryController = require("../controllers/bidHistory.controller");

const router = express.Router();

// Lấy lịch sử đặt giá theo sản phẩm
router.get("/product/:productId", bidHistoryController.getBidHistoryByProduct);

// Lấy lịch sử đặt giá cá nhân
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  bidHistoryController.getBidHistoryByUser,
);

// Lấy tất cả lịch sử đặt giá (với filter)
// router.get("/", bidHistoryController.getAllBidHistory);

// Lấy một lịch sử đặt giá
// router.get("/:id", bidHistoryController.getBidHistoryById);

// Tạo lịch sử đặt giá
// router.post("/", bidHistoryController.createBidHistory);

// Xóa lịch sử đặt giá
// router.delete("/:id", bidHistoryController.deleteBidHistory);

module.exports = router;
