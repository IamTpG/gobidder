const express = require("express");
const passport = require("passport");

const productController = require("../controllers/product.controller");
const { authorizeRoles } = require("../middlewares/auth.middleware");
const { upload, create } = require("../controllers/product.controller");
const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", productController.getProducts);

// Top 5 sản phẩm gần kết thúc
router.get("/top/ending-soon", productController.getTopEndingSoon);

// Top 5 sản phẩm có nhiều lượt ra giá nhất
router.get("/top/most-bids", productController.getTopMostBids);

// Top 5 sản phẩm có giá cao nhất
router.get("/top/highest-price", productController.getTopHighestPrice);

// Lấy danh sách sản phẩm của seller đang login
router.get(
  "/seller/my-products",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller", "ExpiredSeller"),
  productController.getSellerProducts
);

// Admin routes
// Lấy tất cả sản phẩm (Admin only - bao gồm tất cả status)
router.get(
  "/admin/all",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  productController.getAllProductsAdmin
);

// Lấy một sản phẩm chi tiết (Admin only)
router.get(
  "/admin/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  productController.getProductByIdAdmin
);

// Cập nhật sản phẩm (Admin only - có thể sửa bất kỳ sản phẩm nào)
router.put(
  "/admin/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  productController.updateProductAdmin
);

// Xóa sản phẩm (Admin only - set status = Removed)
router.delete(
  "/admin/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  productController.deleteProductAdmin
);

// Lấy sản phẩm liên quan
router.get("/:id/related", productController.getRelatedProducts);

// Lấy một sản phẩm (Sử dụng optionalAuth để xác định user nếu có login)
const optionalAuth = require("../middlewares/optionalAuth.middleware");
router.get("/:id", optionalAuth, productController.getProductById);

// Tạo câu hỏi mới (yêu cầu login)
router.post(
  "/:id/questions",
  passport.authenticate("jwt", { session: false }),
  productController.createQuestion
);

// Append description (Seller only)
router.post(
  "/:id/append-description",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller", "ExpiredSeller"),
  productController.appendDescription
);

// Ban a bidder from product (Seller only)
router.post(
  "/:id/ban-bidder",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller", "ExpiredSeller"),
  require("../controllers/bannedBidder.controller").banBidder
);

// Check if current user is banned from product
router.get(
  "/:id/banned-status",
  passport.authenticate("jwt", { session: false }),
  require("../controllers/bannedBidder.controller").checkBannedStatus
);

// Get all banned bidders for a product (Seller only)
router.get(
  "/:id/banned-bidders",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller", "ExpiredSeller"),
  require("../controllers/bannedBidder.controller").getBannedBidders
);

// Trả lời câu hỏi (yêu cầu login và là seller)
router.post(
  "/:id/questions/:questionId/answer",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller", "ExpiredSeller"),
  productController.answerQuestion
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  upload.array("images", 10),
  create
);

// Cập nhật sản phẩm (Seller only)
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller", "ExpiredSeller"),
  upload.array("images", 10),
  productController.update
);

module.exports = router;
