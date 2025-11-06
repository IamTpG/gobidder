const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// const axios = require('axios'); // Dùng cho reCaptcha

const prisma = new PrismaClient();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465, // TLS nếu port 465
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"GoBidder" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: "Mã OTP xác thực tài khoản Sàn Đấu Giá GoBidder",
    text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

exports.register = async (req, res) => {
  const { fullName, address, email, password, recaptchaToken } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  try {
    /*
    // TODO: Xác thực reCaptcha
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`
    );
    if (!response.data.success) {
      return res.status(400).json({ message: 'Xác thực reCaptcha thất bại' });
    }
    */

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (existingUser.is_email_verified) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      } else {
        await prisma.$transaction([
          prisma.otp.deleteMany({ where: { email: email.toLowerCase() } }),
          prisma.user.delete({ where: { email: email.toLowerCase() } }),
        ]);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        full_name: fullName,
        address: address,
        email: email.toLowerCase(),
        password_hash: password_hash,
        role: "Bidder",
        is_email_verified: false,
      },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await prisma.otp.create({
      data: {
        email: email.toLowerCase(),
        code: otp,
        expires_at: expiresAt,
      },
    });

    const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Không thể gửi email xác thực, vui lòng thử lại" });
    }

    res.status(201).json({
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: email.toLowerCase(),
        code: otp,
        expires_at: { gt: new Date() },
      },
      orderBy: {
        expires_at: "desc",
      },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { is_email_verified: true },
    });

    await prisma.otp.deleteMany({
      where: { email: email.toLowerCase() },
    });

    res.status(200).json({ message: "Xác thực email thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

const signTokenAndSetCookie = (res, user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie(
    "access_token", // Tên cookie
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS ở môi trường production
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 ngày
    },
  );
};

exports.loginCallback = (req, res) => {
  const user = req.user;

  signTokenAndSetCookie(res, user);

  res.status(200).json({
    message: "Đăng nhập thành công",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    },
  });
};

exports.googleCallback = (req, res) => {
  const user = req.user;

  signTokenAndSetCookie(res, user);

  const feUrl = process.env.FE_URL || "http://localhost:3000";
  res.redirect(feUrl);
};
