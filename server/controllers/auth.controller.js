const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
  signTokenAndSetCookie,
  verifyOtpHelper,
} = require("../utils/authHelper");
const cookieExtractor = require("../utils/cookieExtractor");
const { generateOtp, sendOtpEmail } = require("../services/otp.service");

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { fullName, address, email, password, recaptchaToken } = req.body;

  if (!fullName || !email || !password || !recaptchaToken) {
    return res
      .status(400)
      .json({ message: "Missing registration information or captcha" });
  }

  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: { secret: recaptchaSecret, response: recaptchaToken },
      },
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }
  } catch {
    return res.status(500).json({ message: "Error verifying reCAPTCHA" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (existingUser.is_email_verified) {
        return res.status(409).json({ message: "Email already exists" });
      } else {
        await prisma.$transaction([
          prisma.otp.deleteMany({ where: { email: email.toLowerCase() } }),
          prisma.user.delete({ where: { email: email.toLowerCase() } }),
        ]);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        full_name: fullName,
        address,
        birthdate: null,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: "Bidder",
        is_email_verified: false,
      },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

    await prisma.otp.create({
      data: { email: email.toLowerCase(), code: otp, expires_at: expiresAt },
    });

    const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Unable to send OTP email" });
    }

    return res.status(201).json({
      message:
        "Registration successful. Please check your email for OTP verification.",
    });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyRegistrationOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    await verifyOtpHelper(email, otp);

    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { is_email_verified: true },
    });

    signTokenAndSetCookie(
      res,
      {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      "access_token",
      "1d",
    );

    return res.status(200).json({
      message: "Email verification successful. You are now logged in.",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Verification failed" });
  }
};

const loginCallback = (req, res) => {
  const user = req.user;
  signTokenAndSetCookie(
    res,
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
    "access_token",
    "1d",
  );

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
  });
};

const googleCallback = (req, res) => {
  const user = req.user;
  signTokenAndSetCookie(
    res,
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
    "access_token",
    "1d",
  );
  res.redirect(process.env.FE_URL || "http://localhost:3000");
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

    await prisma.otp.create({
      data: { email: email.toLowerCase(), code: otp, expires_at: expiresAt },
    });

    const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Unable to send OTP email" });
    }

    return res.status(201).json({
      message: "Please check your email for OTP verification.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal error" });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    await verifyOtpHelper(email, otp);

    signTokenAndSetCookie(res, { email }, "reset_token", "10m");

    return res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  const resetToken = cookieExtractor(req, "reset_token");

  if (!resetToken) {
    return res
      .status(401)
      .json({ message: "Reset session expired or invalid. Please try again." });
  }

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const email = decoded.email;

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password_hash: passwordHash },
    });

    res.clearCookie("reset_token");

    return res
      .status(200)
      .json({ message: "Password has been reset successfully." });
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const getStatus = (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  res.status(200).json({
    message: "User is authenticated",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
  });
};

const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out" });
};

module.exports = {
  register,
  verifyRegistrationOtp,
  loginCallback,
  googleCallback,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  getStatus,
  logout,
};
