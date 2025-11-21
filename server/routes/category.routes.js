const express = require("express");
const passport = require("passport");
const { authorizeRoles } = require("../middlewares/auth.middleware");

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const router = express.Router();

router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  createCategory,
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  updateCategory,
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  deleteCategory,
);

module.exports = router;
