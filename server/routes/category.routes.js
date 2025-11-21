const express = require("express");
const passport = require("passport");

const { authorizeRoles } = require("../middlewares/auth.middleware");
const categoryController = require("../controllers/category.controller");

const router = express.Router();

// Lấy tất cả danh mục
router.get("/", categoryController.getAllCategories);

// Lấy danh mục theo id
router.get("/:id", categoryController.getCategoryById);

// Tạo danh mục mới
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  categoryController.createCategory,
);

// Cập nhật danh mục
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  categoryController.updateCategory,
);

// Xóa danh mục
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  categoryController.deleteCategory,
);

module.exports = router;
