const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const prisma = require("../config/prisma");

// Lấy token từ cookie
const cookieExtractor = (req, cookieName) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[cookieName];
  }
  return token;
};

// Ký Token và Set Cookie
const signTokenAndSetCookie = (res, payload, cookieName, expiresIn) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

  // Chuyển đổi expiresIn sang milliseconds cho maxAge của cookie
  // Quy ước đơn giản: nếu chuỗi chứa 'd' là ngày, 'm' là phút. Mặc định là 1 ngày.
  let maxAge = 24 * 60 * 60 * 1000;
  if (expiresIn.endsWith("m")) {
    maxAge = parseInt(expiresIn) * 60 * 1000;
  }

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAge,
  });
};

// Xác thực OTP
const verifyOtpHelper = async (email, otp) => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email: email.toLowerCase(),
      code: otp,
      expires_at: { gt: new Date() },
    },
    orderBy: { expires_at: "desc" },
  });

  if (!otpRecord) {
    throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
  }

  // Xóa OTP ngay sau khi verify thành công để tránh dùng lại
  await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

  return true;
};

// Tạo mã OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Gửi email mã OTP
const sendOtpEmail = async (to, otp, { subject, text } = {}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"GoBidder" <${process.env.MAIL_FROM}>`,
    to,
    subject: subject || "Your GoBidder OTP Verification",
    text:
      text ||
      `Your OTP code is: ${otp}. It will expire in 5 minutes. If you did not request this, please ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch {
    return false;
  }
};

// Chuyển tất cả BigInt trong Object thành String (bao gồm những Object con)
const serializeBigInt = (value, visited = new WeakSet()) => {
  // Xử lý null hoặc undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Xử lý BigInt
  if (typeof value === "bigint") {
    return value.toString();
  }

  // Xử lý Date objects (DateTime từ Prisma) - PHẢI kiểm tra trước Array và Object
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Xử lý Array
  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInt(item, visited));
  }

  // Xử lý Object (nhưng không xử lý null)
  if (typeof value === "object") {
    // Tránh circular reference
    if (visited.has(value)) {
      return "[Circular]";
    }

    // Đánh dấu object đã được visit
    visited.add(value);

    try {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [
          key,
          serializeBigInt(val, visited),
        ]),
      );
    } finally {
      // Không cần remove vì WeakSet tự động cleanup
    }
  }

  return value;
};

// Chuẩn hóa email
const normalizeEmail = (email) => {
  return email?.trim().toLowerCase();
};

// Kiểm tra email valid
const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

module.exports = {
  cookieExtractor,
  signTokenAndSetCookie,
  verifyOtpHelper,
  generateOtp,
  sendOtpEmail,
  serializeBigInt,
  normalizeEmail,
  isValidEmail,
};
