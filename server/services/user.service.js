const bcrypt = require("bcryptjs");

const prisma = require("../config/prisma");
const {
  normalizeEmail,
  isValidEmail,
  generateOtp,
  sendOtpEmail,
} = require("../utils/utils");

// Lấy thông tin cá nhân
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

// Cập nhật thông tin cá nhân
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

  const updateData = {};
  if (full_name !== undefined) {
    updateData.full_name = full_name;
  }
  if (address !== undefined) {
    updateData.address = address;
  }
  if (birthdate !== undefined) {
    updateData.birthdate = parsedBirthdate;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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

  return updatedUser;
};

// Đổi mật khẩu cá nhân
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
      "Password change is only available for email/password accounts"
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

// Đổi email cá nhân
const requestEmailChangeService = async (userId, { newEmail, password }) => {
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
      "Email change is only available for email/password accounts"
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

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Password is incorrect");
  }

  // Tạo và gửi email
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Xóa OTP cũ
  await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

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

// Xác nhận đổi email cá nhân
const confirmEmailChangeService = async (
  userId,
  currentEmail,
  { newEmail, otp }
) => {
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

  if (existingUser?.is_email_verified) {
    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });
    throw new Error("Email is already in use");
  } else {
    await prisma.user.deleteMany({ where: { email: normalizedEmail } });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { email: normalizedEmail, is_email_verified: true, google_id: null },
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

// Lấy tất cả người dùng
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

// Lấy thông tin người dùng bằng id
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

// Cập nhật role người dùng (Admin only)
const updateUserRole = async (userId, role) => {
  const validRoles = ["Bidder", "Seller", "Admin"];
  if (!validRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { role },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
    },
  });

  return updatedUser;
};

// --- Seller Upgrade Request Services ---

// Tạo yêu cầu nâng cấp lên Seller
const requestSellerUpgrade = async (userId) => {
  // Check if user already has a pending request
  const existingRequest = await prisma.sellerUpgradeRequest.findUnique({
    where: { user_id: userId },
  });

  if (existingRequest) {
    if (existingRequest.status === "Pending") {
      throw new Error("You already have a pending request");
    }
    // If rejected or expired, allow re-request (update existing or delete and create new? Update is better)
    if (
      existingRequest.status === "Rejected" ||
      existingRequest.status === "Expired"
    ) {
      return await prisma.sellerUpgradeRequest.update({
        where: { user_id: userId },
        data: { status: "Pending", requested_at: new Date(), admin_id: null },
      });
    }
    // If Approved, user is already seller (should be checked by role, but safe to check here)
    if (existingRequest.status === "Approved") {
      throw new Error("You are already a seller");
    }
  }

  return await prisma.sellerUpgradeRequest.create({
    data: { user_id: userId },
  });
};

// Lấy danh sách yêu cầu đang chờ (Admin)
const getPendingSellerRequests = async () => {
  return await prisma.sellerUpgradeRequest.findMany({
    where: { status: "Pending" },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          created_at: true,
        },
      },
    },
    orderBy: { requested_at: "asc" },
  });
};

// Duyệt yêu cầu (Admin)
const approveSellerRequest = async (requestId, adminId) => {
  const request = await prisma.sellerUpgradeRequest.findUnique({
    where: { id: parseInt(requestId) },
  });

  if (!request) throw new Error("Request not found");
  if (request.status !== "Pending") throw new Error("Request is not pending");

  // Transaction: Update request status AND Update user role with approval timestamp
  const [updatedRequest, updatedUser] = await prisma.$transaction([
    prisma.sellerUpgradeRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: "Approved", admin_id: adminId },
    }),
    prisma.user.update({
      where: { id: request.user_id },
      data: { role: "Seller", seller_approved_at: new Date() },
    }),
  ]);

  return { request: updatedRequest, user: updatedUser };
};

// Từ chối yêu cầu (Admin)
const rejectSellerRequest = async (requestId, adminId) => {
  const request = await prisma.sellerUpgradeRequest.findUnique({
    where: { id: parseInt(requestId) },
  });

  if (!request) throw new Error("Request not found");
  if (request.status !== "Pending") throw new Error("Request is not pending");

  return await prisma.sellerUpgradeRequest.update({
    where: { id: parseInt(requestId) },
    data: { status: "Rejected", admin_id: adminId },
  });
};

// Lấy trạng thái yêu cầu của user hiện tại
const getMySellerRequest = async (userId) => {
  return await prisma.sellerUpgradeRequest.findUnique({
    where: { user_id: userId },
  });
};

// Revert expired sellers (those whose trial period of 2 minutes has passed) - FOR TESTING
const revertExpiredSellers = async () => {
  const twoMinutesAgo = new Date();
  twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

  // Find all sellers whose approval was more than 2 minutes ago
  const expiredSellers = await prisma.user.findMany({
    where: {
      role: "Seller",
      seller_approved_at: {
        not: null,
        lte: twoMinutesAgo,
      },
    },
  });

  if (expiredSellers.length === 0) {
    return { message: "No expired sellers found", count: 0 };
  }

  // Revert each seller to bidder
  const results = await Promise.all(
    expiredSellers.map(async (seller) => {
      try {
        await prisma.$transaction([
          // Update user role back to Bidder and clear approval timestamp
          prisma.user.update({
            where: { id: seller.id },
            data: {
              role: "Bidder",
              seller_approved_at: null,
            },
          }),
          // Update their request status to Expired
          prisma.sellerUpgradeRequest.updateMany({
            where: { user_id: seller.id, status: "Approved" },
            data: { status: "Expired" },
          }),
        ]);
        return { id: seller.id, success: true };
      } catch (error) {
        console.error(`Failed to revert seller ${seller.id}:`, error);
        return { id: seller.id, success: false, error: error.message };
      }
    })
  );

  const successCount = results.filter((r) => r.success).length;
  return {
    message: `Reverted ${successCount} out of ${expiredSellers.length} expired sellers`,
    count: successCount,
    total: expiredSellers.length,
    results,
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
  updateUserRole,
  requestSellerUpgrade,
  getPendingSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  getMySellerRequest,
  revertExpiredSellers,
};
