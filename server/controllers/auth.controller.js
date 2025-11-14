const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");

const prisma = new PrismaClient();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp) {
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
    to: email,
    subject: "Your GoBidder Account OTP Verification",
    text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch {
    return false;
  }
}

const register = async (req, res) => {
  const { fullName, address, email, password, recaptchaToken } = req.body;

  if (!fullName || !email || !password || !recaptchaToken) {
    return res.status(400).json({ message: "Missing registration information or captcha" });
  }

  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      { params: { secret: recaptchaSecret, response: recaptchaToken } }
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }
  } catch {
    return res.status(500).json({ message: "Error verifying reCAPTCHA" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (existingUser.is_email_verified) {
        return res.status(409).json({ message: "Email already exists" });
      } else {
        await prisma.$transaction([
          prisma.otp.deleteMany({ where: { email: email.toLowerCase() } }),
          prisma.user.delete({ where: { email: email.toLowerCase() } }),
        ]);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        full_name: fullName,
        address,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: "Bidder",
        is_email_verified: false,
      },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: { email: email.toLowerCase(), code: otp, expires_at: expiresAt },
    });

    const emailSent = await sendOtpEmail(email.toLowerCase(), otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Unable to send OTP email" });
    }

    return res.status(201).json({
      message: "Registration successful. Please check your email for OTP verification.",
    });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const otpRecord = await prisma.otp.findFirst({
      where: { email: email.toLowerCase(), code: otp, expires_at: { gt: new Date() } },
      orderBy: { expires_at: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { is_email_verified: true },
    });

    await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });

    return res.status(200).json({ message: "Email verification successful" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const signTokenAndSetCookie = (res, user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const loginCallback = (req, res) => {
  const user = req.user;
  signTokenAndSetCookie(res, user);
  res.status(200).json({
    message: "Login successful",
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
  });
};

const googleCallback = (req, res) => {
  const user = req.user;
  signTokenAndSetCookie(res, user);
  const feUrl = process.env.FE_URL || "http://localhost:3000";
  res.redirect(feUrl);
};

const getStatus = (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  res.status(200).json({
    message: "User is authenticated",
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
  });
};

module.exports = {
  register,
  verifyOtp,
  loginCallback,
  googleCallback,
  getStatus,
};
