const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Hàm chung để ký Token và Set Cookie
 * @param {Object} res - Response object
 * @param {Object} payload - Dữ liệu muốn lưu trong token
 * @param {String} cookieName - Tên của cookie (vd: 'access_token', 'reset_token')
 * @param {String} expiresIn - Thời gian hết hạn token (vd: '1d', '10m')
 */
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

/**
 * Hàm chung để xác thực OTP
 * @param {String} email
 * @param {String} otp
 * @returns {Boolean} true nếu hợp lệ
 * @throws {Error} nếu không hợp lệ
 */
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

module.exports = {
  signTokenAndSetCookie,
  verifyOtpHelper,
};
