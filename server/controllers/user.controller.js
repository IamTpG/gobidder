const userService = require("../services/user.service");
const productService = require("../services/product.service");
const { signTokenAndSetCookie } = require("../utils/utils");

// Lấy thông tin cá nhân
const getMe = async (req, res) => {
  try {
    // req.user đã có sẵn nhờ Passport verify thành công trước đó
    const result = await userService.getMyProfile(req.user.id);
    return res.json(result);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật thông tin cá nhân
const updateMe = async (req, res) => {
  const { full_name, address, birthdate } = req.body;
  try {
    const updatedUser = await userService.updateMyProfile(req.user.id, {
      full_name,
      address,
      birthdate,
    });
    return res.json(updatedUser);
  } catch (err) {
    if (err.message === "Birthdate is invalid") {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Đổi mật khẩu cá nhân
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await userService.changeUserPassword(req.user.id, {
      currentPassword,
      newPassword,
    });
    return res.json(result);
  } catch (err) {
    if (
      err.message === "Missing password inputs" ||
      err.message.includes("New password must be at least") ||
      err.message === "New password must be different from current one"
    ) {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Current password is incorrect") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message.includes("only available for email/password accounts")) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Đổi email cá nhân
const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;
  try {
    const result = await userService.requestEmailChangeService(req.user.id, {
      newEmail,
      password,
    });
    return res.json(result);
  } catch (err) {
    if (
      err.message === "Invalid email address" ||
      err.message.includes("must be different")
    ) {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Email is already in use") {
      return res.status(409).json({ message: err.message });
    }
    if (err.message.includes("only available for email/password accounts")) {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Password is incorrect") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Unable to send OTP email") {
      return res.status(500).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Xác nhận đổi email cá nhân
const confirmEmailChange = async (req, res) => {
  const { newEmail, otp } = req.body;
  try {
    const result = await userService.confirmEmailChangeService(
      req.user.id,
      req.user.email,
      {
        newEmail,
        otp,
      }
    );

    res.clearCookie("reset_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    signTokenAndSetCookie(
      res,
      {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.full_name,
        role: result.user.role,
      },
      "access_token",
      "1d"
    );

    return res.json(result);
  } catch (err) {
    if (err.message === "Email and OTP are required") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Invalid or expired OTP") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Email is already in use") {
      return res.status(409).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả người dùng
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy thông tin người dùng bằng id
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await productService.getUserByIdService(id);
    return res.json(user);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả sản phẩm cá nhân có đấu giá
const getHistoryBids = async (req, res) => {
  try {
    const bids = await productService.getAllBiddedProducts(req.user.id);
    return res.json(bids);
  } catch (err) {
    console.error("Get History Bids Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả sản phẩm cá nhân đang đấu giá
const getMyActiveBids = async (req, res) => {
  try {
    const bids = await productService.getUserActiveBids(req.user.id);
    return res.json(bids);
  } catch (err) {
    console.error("Get Active Bids Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả sản phẩm cá nhân đã thắng đấu giá
const getMyWonProducts = async (req, res) => {
  try {
    const products = await productService.getUserWonProducts(req.user.id);
    return res.json(products);
  } catch (err) {
    console.error("Get Won Products Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả sản phẩm cá nhân của seller
const getMyProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryIdParam = req.query.categoryId ?? req.query.category;
    const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
    const sort = req.query.sort || "created_at";
    const q = req.query.q || "";
    const status = req.query.status; // Có thể filter theo status (Active, Sold, Expired, etc.)

    const maxLimit = 50;
    const validateLimit = Math.min(limit, maxLimit);
    const validatePage = Math.max(page, 1);
    const skip = (validatePage - 1) * validateLimit;

    const result = await productService.getProductsBySellerId({
      sellerId: req.user.id,
      page: validatePage,
      limit: validateLimit,
      categoryId,
      sort,
      q,
      skip,
      status,
    });

    return res.status(200).json({
      data: result.data,
      pagination: {
        page: validatePage,
        limit: validateLimit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    });
  } catch (err) {
    console.error("Get My Products Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật role người dùng
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const updatedUser = await userService.updateUserRole(id, role);
    return res.json(updatedUser);
  } catch (err) {
    if (err.message === "Invalid role") {
      return res.status(400).json({ message: err.message });
    }
    // Prisma error for record not found
    if (err.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Seller Request Controllers ---

const requestSeller = async (req, res) => {
  try {
    const result = await userService.requestSellerUpgrade(req.user.id);
    return res.json(result);
  } catch (err) {
    if (
      err.message === "You already have a pending request" ||
      err.message === "You are already a seller"
    ) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getSellerRequests = async (req, res) => {
  try {
    const requests = await userService.getPendingSellerRequests();
    return res.json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const approveSeller = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.approveSellerRequest(id, req.user.id);
    return res.json(result);
  } catch (err) {
    if (err.message === "Request not found")
      return res.status(404).json({ message: err.message });
    if (err.message === "Request is not pending")
      return res.status(400).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const rejectSeller = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.rejectSellerRequest(id, req.user.id);
    return res.json(result);
  } catch (err) {
    if (err.message === "Request not found")
      return res.status(404).json({ message: err.message });
    if (err.message === "Request is not pending")
      return res.status(400).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyRequestStatus = async (req, res) => {
  try {
    const result = await userService.getMySellerRequest(req.user.id);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const createUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    const newUser = await userService.createUser({
      full_name,
      email,
      password,
      role,
    });
    return res.status(201).json(newUser);
  } catch (err) {
    if (err.message === "Email is already in use") {
      return res.status(409).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, role, password, address, birthdate } = req.body;
  try {
    const updatedUser = await userService.updateUser(id, {
      full_name,
      email,
      role,
      password,
      address,
      birthdate,
    });
    const message =
      updatedUser.role === "Banned"
        ? "User has been banned"
        : "User updated successfully";

    return res.json({
      message,
      user: updatedUser,
    });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Email is already in use") {
      return res.status(409).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUser(id);
    return res.json(result);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const adminResetUserPassword = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.adminResetUserPassword(id);
    return res.json(result);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả ratings mà user nhận được
const getMyRatings = async (req, res) => {
  try {
    const ratings = await userService.getMyRatings(req.user.id);
    return res.json(ratings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMe,
  getUsers,
  getUserById,
  updateMe,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
  getHistoryBids,
  getMyActiveBids,
  getMyWonProducts,
  getMyProducts,
  updateUserRole,
  requestSeller,
  getSellerRequests,
  approveSeller,
  rejectSeller,
  getMyRequestStatus,
  createUser,
  updateUser,
  deleteUser,
  getMyRatings,
  adminResetUserPassword,
};
