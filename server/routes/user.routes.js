const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authorizeRoles } = require("../middlewares/auth.middleware");
const passport = require("passport");

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  userController.getMe,
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  userController.getUsers,
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Admin"),
  userController.getUserById,
);

router.put(
  "/me",
  passport.authenticate("jwt", { session: false }),
  userController.updateMe,
);

router.post(
  "/me/change-password",
  passport.authenticate("jwt", { session: false }),
  userController.changePassword,
);

router.post(
  "/me/request-email-change",
  passport.authenticate("jwt", { session: false }),
  userController.requestEmailChange,
);

router.post(
  "/me/confirm-email-change",
  passport.authenticate("jwt", { session: false }),
  userController.confirmEmailChange,
);

module.exports = router;
