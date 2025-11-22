const userService = require("../services/user.service");
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
      },
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
      "1d",
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

module.exports = {
  getMe,
  getUsers,
  getUserById,
  updateMe,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
