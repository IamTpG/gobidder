const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { generateOtp, sendOtpEmail } = require("./otp.service"); // Giả định đường dẫn

const prisma = new PrismaClient();

// Helper functions (giữ nguyên)
const normalizeEmail = (email) => email?.trim().toLowerCase();
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

/**
 * Lấy thông tin chi tiết của user đang đăng nhập
 */
const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
      birthdate: true,
      address: true,
      password_hash: true,
      google_id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password_hash, google_id, ...rest } = user;
  return {
    ...rest,
    auth_provider: google_id ? "google" : "local",
    can_change_credentials: Boolean(password_hash),
  };
};

/**
 * Lấy danh sách tất cả users (Admin)
 */
const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
      birthdate: true,
    },
  });
};

/**
 * Lấy thông tin user theo ID (Admin)
 */
const getUserByIdService = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
      birthdate: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Cập nhật thông tin cá nhân (Profile)
 */
const updateMyProfile = async (userId, { full_name, address, birthdate }) => {
  let parsedBirthdate;
  if (birthdate !== undefined) {
    if (birthdate === null || birthdate === "") {
      parsedBirthdate = null;
    } else {
      const dateObj = new Date(birthdate);
      if (Number.isNaN(dateObj.getTime())) {
        throw new Error("Birthdate is invalid");
      }
      parsedBirthdate = dateObj;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      full_name: full_name ?? undefined,
      address: address ?? undefined,
      birthdate: birthdate !== undefined ? parsedBirthdate : undefined,
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
      birthdate: true,
    },
  });

  return updatedUser;
};

/**
 * Đổi mật khẩu
 */
const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Missing password inputs");
  }
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password_hash: true },
  });

  if (!user || !user.password_hash) {
    throw new Error(
      "Password change is only available for email/password accounts",
    );
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    throw new Error("New password must be different from current one");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: hashedPassword },
  });

  return { message: "Password updated successfully" };
};

/**
 * Yêu cầu đổi email (Gửi OTP đến email MỚI)
 */
const requestEmailChangeService = async (userId, newEmail) => {
  const normalizedEmail = normalizeEmail(newEmail);

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    throw new Error("Invalid email address");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, password_hash: true },
  });

  if (!user || !user.password_hash) {
    throw new Error(
      "Email change is only available for email/password accounts",
    );
  }

  if (user.email === normalizedEmail) {
    throw new Error("New email must be different from current email");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail, is_email_verified: true },
    select: { is_email_verified: true },
  });

  if (existingUser) {
    throw new Error("Email is already in use");
  }

  // Xóa OTP cũ của email MỚI (nếu có)
  await prisma.otp.deleteMany({
    where: { email: normalizedEmail },
  });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otp.create({
    data: { email: normalizedEmail, code: otp, expires_at: expiresAt },
  });

  const emailSent = await sendOtpEmail(normalizedEmail, otp, {
    subject: "Confirm your new GoBidder email",
    text: `Your OTP for changing to ${normalizedEmail} is ${otp}. It expires in 5 minutes.`,
  });

  if (!emailSent) {
    // Clean up nếu gửi mail lỗi
    await prisma.otp.deleteMany({
      where: { email: normalizedEmail, code: otp },
    });
    throw new Error("Unable to send OTP email");
  }

  return {
    message: "OTP sent to new email. Please verify to complete the change.",
  };
};

/**
 * Xác nhận đổi email (Verify OTP & Update Email)
 */
const confirmEmailChangeService = async (userId, { newEmail, otp }) => {
  const normalizedEmail = normalizeEmail(newEmail);

  if (!normalizedEmail || !otp) {
    throw new Error("Email and OTP are required");
  }

  const otpRecord = await prisma.otp.findFirst({
    where: {
      email: normalizedEmail,
      code: otp,
      expires_at: { gt: new Date() },
    },
    orderBy: { expires_at: "desc" },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP");
  }

  // Kiểm tra lại lần nữa xem email đã bị ai lấy mất chưa trong lúc chờ OTP
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { is_email_verified: true },
  });

  if (existingUser) {
    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });
    throw new Error("Email is already in use");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { email: normalizedEmail, is_email_verified: true },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
      birthdate: true,
      address: true,
    },
  });

  await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

  return {
    message: "Email updated successfully",
    user: updatedUser,
  };
};

module.exports = {
  getMyProfile,
  getAllUsers,
  getUserByIdService,
  updateMyProfile,
  changeUserPassword,
  requestEmailChangeService,
  confirmEmailChangeService,
};
