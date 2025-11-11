const express = require("express");
const passport = require("passport");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Đăng ký
// POST /api/auth/register
router.post("/register", authController.register);

// Xác thực OTP
// POST /api/auth/verify-otp
router.post("/verify-otp", authController.verifyOtp);

// Đăng nhập Local (dùng email)
// POST /api/auth/login
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.loginCallback, // Chỉ chạy nếu xác thực thành công
);

// Đăng nhập Google
// GET /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Đăng nhập Google (Callback)
// GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth",
  }),
  authController.googleCallback,
);

router.get(
  "/status",
  passport.authenticate("jwt", { session: false }),
  authController.getStatus,
);

module.exports = router;
