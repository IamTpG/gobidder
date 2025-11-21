const authService = require("../services/auth.service");
const { signTokenAndSetCookie } = require("../utils/authHelper");
const cookieExtractor = require("../utils/cookieExtractor");

// Đăng ký thông tin ban đầu & gửi OTP
const register = async (req, res) => {
  const { fullName, address, email, password, recaptchaToken } = req.body;

  // Validate cơ bản
  if (!fullName || !email || !password || !recaptchaToken) {
    return res
      .status(400)
      .json({ message: "Missing registration information or captcha" });
  }

  try {
    // Gọi service xử lý logic
    const result = await authService.registerUser({
      fullName,
      address,
      email,
      password,
      recaptchaToken,
    });

    return res.status(201).json(result);
  } catch (error) {
    // Xử lý các lỗi nghiệp vụ cụ thể để trả về status code đúng
    if (error.message === "Email already exists") {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes("reCAPTCHA")) {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Xác thực OTP đăng ký & Tự động đăng nhập
const verifyRegistrationOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Gọi service để verify và kích hoạt user
    const user = await authService.verifyRegistrationOtpService(email, otp);

    // Đăng nhập ngay lập tức: Tạo Token & Set Cookie
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
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Verification failed" });
  }
};

// Callback cho Passport Local Strategy
const loginCallback = (req, res) => {
  // req.user đã có sẵn nhờ Passport verify thành công trước đó
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

// Callback cho Passport Google Strategy
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

  // Redirect về Frontend sau khi set cookie xong
  res.redirect(process.env.FE_URL || "http://localhost:3000");
};

// Gửi yêu cầu quên mật khẩu (Gửi OTP)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await authService.initiateForgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "User not found") {
      // Có thể trả về 200 giả để bảo mật, hoặc 404 tùy yêu cầu
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal error" });
  }
};

// Xác thực OTP quên mật khẩu & Cấp quyền đổi pass (Reset Token)
const verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    await authService.verifyForgotPasswordOtpService(email, otp);

    // Cấp Reset Token (Cookie ngắn hạn 10 phút)
    signTokenAndSetCookie(res, { email }, "reset_token", "10m");

    return res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Đặt mật khẩu mới (Sử dụng Reset Token từ Cookie)
const resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  // Lấy token từ cookie (thay vì body)
  const resetToken = cookieExtractor(req, "reset_token");

  if (!resetToken) {
    return res
      .status(401)
      .json({ message: "Reset session expired or invalid. Please try again." });
  }

  try {
    const result = await authService.resetUserPassword(resetToken, newPassword);

    // Xóa cookie reset_token sau khi đổi pass thành công
    res.clearCookie("reset_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid token or expired session" });
  }
};

// Kiểm tra trạng thái đăng nhập (Dùng cho AuthContext FE)
const getStatus = (req, res) => {
  const user = req.user; // Lấy từ JWT middleware
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

// Đăng xuất (Xóa cookie)
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
