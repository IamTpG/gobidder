const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { verifyOtpHelper } = require("../utils/authHelper");
const { generateOtp, sendOtpEmail } = require("./otp.service"); // Giả định bạn đã có file này như code cũ

const prisma = new PrismaClient();

/**
 * Xử lý logic đăng ký người dùng
 */
const registerUser = async ({
  fullName,
  address,
  email,
  password,
  recaptchaToken,
}) => {
  // 1. Verify ReCAPTCHA
  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      { params: { secret: recaptchaSecret, response: recaptchaToken } },
    );

    if (!response.data.success) {
      throw new Error("reCAPTCHA verification failed");
    }
  } catch (error) {
    throw new Error(error.message || "Error verifying reCAPTCHA");
  }

  // 2. Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    if (existingUser.is_email_verified) {
      throw new Error("Email already exists"); // Sẽ được catch ở controller thành 409
    } else {
      // Xóa user cũ chưa verify để đăng ký lại
      await prisma.$transaction([
        prisma.otp.deleteMany({ where: { email: email.toLowerCase() } }),
        prisma.user.delete({ where: { email: email.toLowerCase() } }),
      ]);
    }
  }

  // 3. Hash password & Create User
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

  // 4. Generate & Send OTP
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Cleanup old OTPs
  await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

  await prisma.otp.create({
    data: { email: email.toLowerCase(), code: otp, expires_at: expiresAt },
  });

  const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
  if (!emailSent) {
    throw new Error("Unable to send OTP email");
  }

  return { message: "Registration successful. Please check your email." };
};

/**
 * Xử lý verify OTP đăng ký và kích hoạt user
 */
const verifyRegistrationOtpService = async (email, otp) => {
  // Helper check OTP DB
  await verifyOtpHelper(email, otp);

  // Update User status
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { is_email_verified: true },
  });

  return user; // Trả về user để controller set cookie
};

/**
 * Xử lý logic yêu cầu quên mật khẩu
 */
const initiateForgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new Error("User not found"); // Controller sẽ map ra 404
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

  await prisma.otp.create({
    data: { email: email.toLowerCase(), code: otp, expires_at: expiresAt },
  });

  const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
  if (!emailSent) {
    throw new Error("Unable to send OTP email");
  }

  return { message: "OTP sent to your email." };
};

/**
 * Xử lý verify OTP quên mật khẩu
 */
const verifyForgotPasswordOtpService = async (email, otp) => {
  // Chỉ cần verify OTP hợp lệ, controller sẽ chịu trách nhiệm ký reset_token
  await verifyOtpHelper(email, otp);
  return true;
};

/**
 * Xử lý đặt lại mật khẩu mới
 */
const resetUserPassword = async (resetToken, newPassword) => {
  // Verify token logic nằm ở service để clean controller
  const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  const email = decoded.email;

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { password_hash: passwordHash },
  });

  return { message: "Password has been reset successfully." };
};

module.exports = {
  registerUser,
  verifyRegistrationOtpService,
  initiateForgotPassword,
  verifyForgotPasswordOtpService,
  resetUserPassword,
};
