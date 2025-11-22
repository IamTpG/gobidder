const express = require("express");
const passport = require("passport");

const productController = require("../controllers/product.controller");
const { authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", productController.getProducts);

// Lấy một sản phẩm
router.get("/:id", productController.getProductById);

// Tạo câu hỏi mới (yêu cầu login)
router.post(
  "/:id/questions",
  passport.authenticate("jwt", { session: false }),
  productController.createQuestion,
);

// Trả lời câu hỏi (yêu cầu login và là seller)
router.post(
  "/:id/questions/:questionId/answer",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  productController.answerQuestion,
);

module.exports = router;
