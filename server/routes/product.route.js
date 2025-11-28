const express = require("express");
const passport = require("passport");

const productController = require("../controllers/product.controller");
const { authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", productController.getProducts);

// Top 5 sản phẩm gần kết thúc
router.get("/top/ending-soon", productController.getTopEndingSoon);

// Top 5 sản phẩm có nhiều lượt ra giá nhất
router.get("/top/most-bids", productController.getTopMostBids);

// Top 5 sản phẩm có giá cao nhất
router.get("/top/highest-price", productController.getTopHighestPrice);

// Lấy sản phẩm liên quan
router.get("/:id/related", productController.getRelatedProducts);

// Lấy một sản phẩm
router.get("/:id", productController.getProductById);

// Tạo câu hỏi mới (yêu cầu login)
router.post(
  "/:id/questions",
  passport.authenticate("jwt", { session: false }),
  productController.createQuestion,
);

// Append description (Seller only)
router.post(
  "/:id/append-description",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  productController.appendDescription,
);

// Trả lời câu hỏi (yêu cầu login và là seller)
router.post(
  "/:id/questions/:questionId/answer",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  productController.answerQuestion,
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  productController.create,
);

// Cập nhật sản phẩm (Seller only)
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  productController.update,
);

// Lấy danh sách sản phẩm của seller đang login
router.get(
  "/seller/my-products",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  productController.getSellerProducts,
);

module.exports = router;
