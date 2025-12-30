const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const prisma = require("../config/prisma");
const {
  verifyOtpHelper,
  generateOtp,
  sendOtpEmail,
} = require("../utils/utils");

// Xử lý logic đăng ký người dùng
const registerUser = async ({
  fullName,
  address,
  email,
  password,
  recaptchaToken,
}) => {
  // Xác thực ReCAPTCHA
  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      { params: { secret: recaptchaSecret, response: recaptchaToken } }
    );

    if (!response.data.success) {
      throw new Error("reCAPTCHA verification failed");
    }
  } catch (error) {
    throw new Error(error.message || "Error verifying reCAPTCHA");
  }

  // Kiểm tra người dùng tồn tại
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

  // Băm mật khẩu & tạo người dùng
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

  // Tạo và gửi email
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Xóa OTP cũ
  await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

  await prisma.otp.create({
    data: { email: email.toLowerCase(), code: otp, expires_at: expiresAt },
  });

  const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
  if (!emailSent) {
    // Clean up nếu gửi mail lỗi
    await prisma.otp.deleteMany({
      where: { email: email.toLowerCase(), code: otp },
    });
    throw new Error("Unable to send OTP email");
  }

  return { message: "Registration successful. Please check your email." };
};

// Xử lý verify OTP đăng ký và kích hoạt user
const verifyRegistrationOtpService = async (email, otp) => {
  await verifyOtpHelper(email, otp);

  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { is_email_verified: true },
  });

  // Trả về user để controller set cookie
  return user;
};

// Xử lý logic yêu cầu quên mật khẩu
const initiateForgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Controller sẽ map ra 404
    throw new Error("User not found");
  }

  // Tạo và gửi email
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Xóa OTP cũ
  await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

  await prisma.otp.create({
    data: { email: email.toLowerCase(), code: otp, expires_at: expiresAt },
  });

  const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
  if (!emailSent) {
    // Clean up nếu gửi mail lỗi
    await prisma.otp.deleteMany({
      where: { email: email.toLowerCase(), code: otp },
    });
    throw new Error("Unable to send OTP email");
  }

  return { message: "OTP sent to your email." };
};

// Xử lý verify OTP quên mật khẩu
const verifyForgotPasswordOtpService = async (email, otp) => {
  // Chỉ cần verify OTP hợp lệ, controller sẽ chịu trách nhiệm ký reset_token
  await verifyOtpHelper(email, otp);
  return true;
};

// Xử lý đặt lại mật khẩu mới
const resetUserPassword = async (resetToken, newPassword) => {
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
