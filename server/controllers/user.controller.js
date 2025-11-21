const userService = require("../services/user.service");

// Lấy thông tin bản thân
const getMe = async (req, res) => {
  try {
    // req.user.id đến từ middleware xác thực (Passport JWT)
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

// Lấy danh sách user (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy thông tin user theo ID (Admin)
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserByIdService(id);
    return res.json(user);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cập nhật thông tin bản thân
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

// Đổi mật khẩu
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
      return res.status(400).json({ message: err.message }); // Hoặc 401/403 tùy logic
    }
    if (err.message.includes("only available for email/password accounts")) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Yêu cầu đổi Email
const requestEmailChange = async (req, res) => {
  const { newEmail } = req.body;
  try {
    const result = await userService.requestEmailChangeService(
      req.user.id,
      newEmail,
    );
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
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Xác nhận đổi Email (Verify OTP)
const confirmEmailChange = async (req, res) => {
  const { newEmail, otp } = req.body;
  try {
    const result = await userService.confirmEmailChangeService(req.user.id, {
      newEmail,
      otp,
    });
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

module.exports = {
  getMe,
  getUsers,
  getUserById,
  updateMe,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
