const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");

router.get("/me", isAuth, userController.getMe);
router.get("/", isAdmin, userController.getUsers);
router.get("/:id", isAdmin, userController.getUserById);
router.put("/me", isAuth, userController.updateMe);
router.post("/me/change-password", isAuth, userController.changePassword);
router.post(
  "/me/request-email-change",
  isAuth,
  userController.requestEmailChange,
);
router.post(
  "/me/confirm-email-change",
  isAuth,
  userController.confirmEmailChange,
);

module.exports = router;

module.exports = router;
