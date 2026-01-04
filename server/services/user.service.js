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
      rating_plus: true,
      rating_minus: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password_hash, google_id, ...rest } = user;

  // Tính toán rating score tổng hợp
  const totalRatings = user.rating_plus + user.rating_minus;
  const ratingScore =
    totalRatings > 0 ? ((user.rating_plus / totalRatings) * 100).toFixed(1) : 0;
  const ratingDifference = user.rating_plus - user.rating_minus;

  return {
    ...rest,
    auth_provider: google_id ? "google" : "local",
    can_change_credentials: Boolean(password_hash),
    rating: {
      positive: user.rating_plus,
      negative: user.rating_minus,
      total: totalRatings,
      score: parseFloat(ratingScore),
      difference: ratingDifference,
    },
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
  const validRoles = ["Bidder", "Seller", "ExpiredSeller", "Admin"];
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

  // Check user role - only Bidder can request seller upgrade
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user.role === "ExpiredSeller") {
    throw new Error(
      "Please wait until all your products are sold/expired before requesting seller upgrade again"
    );
  }

  if (user.role === "Seller") {
    throw new Error("You are already a seller");
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

// Revert expired sellers
const revertExpiredSellers = async () => {
  const expireDays = new Date();
  expireDays.setDate(expireDays.getDate() - 7);

  // Find all sellers whose approval was more than 2 minutes ago
  const expiredSellers = await prisma.user.findMany({
    where: {
      role: "Seller",
      seller_approved_at: {
        not: null,
        lte: expireDays,
      },
    },
  });

  // Revert each seller based on whether they have active products
  const results = await Promise.all(
    expiredSellers.map(async (seller) => {
      try {
        // Check if seller has any active products (Pending or Active status AND not expired yet)
        const activeProductsCount = await prisma.product.count({
          where: {
            seller_id: seller.id,
            status: { in: ["Pending", "Active"] },
            end_time: { gt: new Date() }, // Only count products that haven't reached end_time
          },
        });

        // If they have active products, change to ExpiredSeller
        if (activeProductsCount > 0) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: seller.id },
              data: { role: "ExpiredSeller" },
            }),
            prisma.sellerUpgradeRequest.updateMany({
              where: { user_id: seller.id, status: "Approved" },
              data: { status: "Expired" },
            }),
          ]);
          return {
            id: seller.id,
            success: true,
            changedToExpired: true,
            activeProducts: activeProductsCount,
          };
        }

        // No active products, downgrade to Bidder
        await prisma.$transaction([
          prisma.user.update({
            where: { id: seller.id },
            data: {
              role: "Bidder",
              seller_approved_at: null,
            },
          }),
          prisma.sellerUpgradeRequest.updateMany({
            where: { user_id: seller.id, status: "Approved" },
            data: { status: "Expired" },
          }),
        ]);
        return { id: seller.id, success: true, downgraded: true };
      } catch (error) {
        console.error(`Failed to process seller ${seller.id}:`, error);
        return { id: seller.id, success: false, error: error.message };
      }
    })
  );

  // Also check ExpiredSellers without products and downgrade them
  const expiredSellersWithoutProducts = await prisma.user.findMany({
    where: { role: "ExpiredSeller" },
  });

  const cleanupResults = await Promise.all(
    expiredSellersWithoutProducts.map(async (user) => {
      try {
        // Count active products: Pending/Active status AND not yet expired (end_time > now)
        const activeProductsCount = await prisma.product.count({
          where: {
            seller_id: user.id,
            status: { in: ["Pending", "Active"] },
            end_time: { gt: new Date() }, // Only count products that haven't reached end_time
          },
        });

        if (activeProductsCount === 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "Bidder", seller_approved_at: null },
          });
          return { id: user.id, success: true, cleanedUp: true };
        }
        return { id: user.id, success: true, stillHasProducts: true };
      } catch (error) {
        console.error(`Failed to cleanup ExpiredSeller ${user.id}:`, error);
        return { id: user.id, success: false, error: error.message };
      }
    })
  );

  const successCount = results.filter((r) => r.success).length;
  const downgradedCount = results.filter((r) => r.downgraded).length;
  const expiredSellerCount = results.filter((r) => r.changedToExpired).length;
  const cleanedUpCount = cleanupResults.filter((r) => r.cleanedUp).length;

  return {
    message: `Processed ${expiredSellers.length} expired seller(s): ${downgradedCount} → Bidder, ${expiredSellerCount} → ExpiredSeller | Cleaned up ${cleanedUpCount} ExpiredSeller(s) → Bidder`,
    count: successCount,
    downgraded: downgradedCount,
    changedToExpired: expiredSellerCount,
    cleanedUp: cleanedUpCount,
    total: expiredSellers.length,
    results,
    cleanupResults,
  };
};

const createUser = async ({ full_name, email, password, role }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Invalid email address");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Email is already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      full_name,
      email: normalizedEmail,
      password_hash: hashedPassword,
      role: role || "Bidder",
      is_email_verified: true, // Admin created users are verified by default
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });

  return newUser;
};

const updateUser = async (
  id,
  { full_name, email, role, password, address, birthdate }
) => {
  const userId = parseInt(id);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const updateData = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (role !== undefined) updateData.role = role;
  if (address !== undefined) updateData.address = address;

  if (birthdate !== undefined) {
    if (birthdate === null || birthdate === "") {
      updateData.birthdate = null;
    } else {
      const dateObj = new Date(birthdate);
      if (Number.isNaN(dateObj.getTime())) {
        throw new Error("Birthdate is invalid");
      }
      updateData.birthdate = dateObj;
    }
  }

  if (email) {
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        throw new Error("Email is already in use");
      }
      updateData.email = normalizedEmail;
    }
  }

  if (password) {
    updateData.password_hash = await bcrypt.hash(password, 10);
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
      address: true,
      birthdate: true,
    },
  });

  return updatedUser;
};

const deleteUser = async (id) => {
  const userId = parseInt(id);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: "Banned" },
    select: { id: true, role: true },
  });

  return { message: "User has been banned", user: updatedUser };
};

// Lấy tất cả ratings mà user nhận được
const getMyRatings = async (userId) => {
  const ratings = await prisma.rating.findMany({
    where: {
      rated_user_id: userId,
    },
    include: {
      rater: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
      transaction: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return ratings.map((rating) => ({
    id: rating.id,
    score: rating.score,
    comment: rating.comment,
    createdAt: rating.created_at,
    rater: {
      id: rating.rater.id,
      fullName: rating.rater.full_name,
      email: rating.rater.email,
    },
    transaction: {
      id: rating.transaction.id,
      product: {
        id: rating.transaction.product.id,
        name: rating.transaction.product.name,
        images: Array.isArray(rating.transaction.product.images)
          ? rating.transaction.product.images
          : typeof rating.transaction.product.images === "string"
            ? JSON.parse(rating.transaction.product.images)
            : [],
      },
    },
  }));
};

// Admin reset password cho user
const adminResetUserPassword = async (targetUserId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(targetUserId) },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate random password (6 chars, alphanumeric)
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let newPassword = "";
  for (let i = 0; i < 6; i++) {
    newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: parseInt(targetUserId) },
    data: { password_hash: hashedPassword },
  });

  const { sendMail } = require("../utils/utils");
  await sendMail({
    to: user.email,
    subject: "Your GoBidder Password Has Been Reset",
    text: `Your password has been reset by an administrator.\n\nYour new password is: ${newPassword}\n\nPlease login and change your password immediately.`,
  });

  return { message: "Password reset successfully and email sent to user." };
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
  createUser,
  updateUser,
  deleteUser,
  getMyRatings,
  adminResetUserPassword,
};
