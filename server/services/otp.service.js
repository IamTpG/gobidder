const nodemailer = require("nodemailer");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(to, otp, { subject, text } = {}) {
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
}

module.exports = {
  generateOtp,
  sendOtpEmail,
};
