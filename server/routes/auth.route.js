const express = require("express");
const passport = require("passport");

const authController = require("../controllers/auth.controller");

const router = express.Router();

// Đăng ký
router.post("/register", authController.register);

// Xác thực OTP Đăng ký
router.post("/verify-otp", authController.verifyRegistrationOtp);

// Đăng nhập Local
router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message,
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  authController.loginCallback,
);

// Đăng nhập Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Đăng nhập Google (Callback)
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      const FE_URL = process.env.FE_URL || "http://localhost:3000";
      if (err) {
        return res.redirect(`${FE_URL}/auth?error=server_error`);
      }
      if (!user) {
        return res.redirect(`${FE_URL}/auth?error=${info.message}`);
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  authController.googleCallback,
);

// Kiểm tra trạng thái đăng nhập
router.get(
  "/status",
  passport.authenticate("jwt", { session: false }),
  authController.getStatus,
);

// Quên mật khẩu
router.post("/forgot-password", authController.forgotPassword);

// Xác nhận OTP Quên mật khẩu
router.post(
  "/verify-forgot-password-otp",
  authController.verifyForgotPasswordOtp,
);

// Đặt lại mật khẩu
router.post("/reset-password", authController.resetPassword);

// Đăng xuất
router.post("/logout", authController.logout);

module.exports = router;
