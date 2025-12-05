const express = require("express");
const passport = require("passport");

const { authorizeRoles } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

// Lấy thông tin cá nhân
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  userController.getMe
);

// Cập nhật thông tin cá nhân
router.put(
  "/me",
  passport.authenticate("jwt", { session: false }),
  userController.updateMe
);

// Đổi mật khẩu cá nhân
router.post(
  "/me/change-password",
  passport.authenticate("jwt", { session: false }),
  userController.changePassword
);

// Đổi email cá nhân
router.post(
  "/me/request-email-change",
  passport.authenticate("jwt", { session: false }),
  userController.requestEmailChange
);

// Xác nhận đổi email cá nhân
router.post(
  "/me/confirm-email-change",
  passport.authenticate("jwt", { session: false }),
  userController.confirmEmailChange
);

// Lấy trạng thái yêu cầu seller
router.get(
  "/me/request-seller",
  passport.authenticate("jwt", { session: false }),
  userController.getMyRequestStatus
);

// Tạo yêu cầu trở thành seller
router.post(
  "/me/request-seller",
  passport.authenticate("jwt", { session: false }),
  userController.requestSeller
);

// Lấy tất cả người dùng
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  userController.getUsers
);

// Lấy tất cả sản phẩm cá nhân có đấu giá
router.get(
  "/me/bids/history",
  passport.authenticate("jwt", { session: false }),
  userController.getHistoryBids
);

// Lấy tất cả sản phẩm cá nhân đang đấu giá
router.get(
  "/me/bids/active",
  passport.authenticate("jwt", { session: false }),
  userController.getMyActiveBids
);

// Lấy tất cả sản phẩm cá nhân đã thắng đấu giá
router.get(
  "/me/bids/won",
  passport.authenticate("jwt", { session: false }),
  userController.getMyWonProducts
);

// Lấy danh sách sản phẩm của seller
router.get(
  "/me/products",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  userController.getMyProducts
);

// --- Admin Routes for Seller Requests ---

// Lấy tất cả seller requests (Admin)
router.get(
  "/admin/seller-requests",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  userController.getSellerRequests
);

// Phê duyệt seller request (Admin)
router.post(
  "/admin/seller-requests/:id/approve",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  userController.approveSeller
);

// Từ chối seller request (Admin)
router.post(
  "/admin/seller-requests/:id/reject",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  userController.rejectSeller
);

// Lấy thông tin người dùng bằng id
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  userController.getUserById
);

module.exports = router;
