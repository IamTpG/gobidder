const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { generateOtp, sendOtpEmail } = require("../services/otp.service");

const prisma = new PrismaClient();

const normalizeEmail = (email) => email?.trim().toLowerCase();
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password_hash, google_id, ...rest } = user;
    res.json({
      ...rest,
      auth_provider: google_id ? "google" : "local",
      can_change_credentials: Boolean(password_hash),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
        birthdate: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
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
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMe = async (req, res) => {
  const { full_name, address, birthdate } = req.body;
  try {
    let parsedBirthdate;
    if (birthdate !== undefined) {
      if (birthdate === null || birthdate === "") {
        parsedBirthdate = null;
      } else {
        const dateObj = new Date(birthdate);
        if (Number.isNaN(dateObj.getTime())) {
          return res.status(400).json({ message: "Birthdate is invalid" });
        }
        parsedBirthdate = dateObj;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        full_name: full_name ?? undefined,
        address: address ?? undefined,
        birthdate: birthdate !== undefined ? parsedBirthdate : undefined,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
        birthdate: true,
      },
    });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing password inputs" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password_hash: true },
    });

    if (!user || !user.password_hash) {
      return res
        .status(400)
        .json({
          message:
            "Password change is only available for email/password accounts",
        });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password must be different from current one" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password_hash: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestEmailChange = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.newEmail);

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, password_hash: true },
    });

    if (!user || !user.password_hash) {
      return res
        .status(400)
        .json({
          message: "Email change is only available for email/password accounts",
        });
    }

    if (user.email === normalizedEmail) {
      return res
        .status(400)
        .json({ message: "New email must be different from current email" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { is_email_verified: true },
    });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    await prisma.otp.deleteMany({
      where: { email: normalizedEmail },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: { email: normalizedEmail, code: otp, expires_at: expiresAt },
    });

    const emailSent = await sendOtpEmail(normalizedEmail, otp, {
      subject: "Confirm your new GoBidder email",
      text: `Your OTP for changing to ${normalizedEmail} is ${otp}. It expires in 5 minutes.`,
    });

    if (!emailSent) {
      await prisma.otp.deleteMany({
        where: { email: normalizedEmail, code: otp },
      });
      return res.status(500).json({ message: "Unable to send OTP email" });
    }

    res.json({
      message: "OTP sent to new email. Please verify to complete the change.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.confirmEmailChange = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.newEmail);
  const { otp } = req.body;

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        code: otp,
        expires_at: { gt: new Date() },
      },
      orderBy: { expires_at: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { is_email_verified: true },
    });
    if (existingUser) {
      await prisma.otp.deleteMany({ where: { email: normalizedEmail } });
      return res.status(409).json({ message: "Email is already in use" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { email: normalizedEmail, is_email_verified: true },
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

    res.json({
      message: "Email updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
