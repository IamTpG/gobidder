const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["access_token"]; // Tên cookie
  }
  return token;
};

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.id },
        });

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          return done(null, false, { message: "Email không tồn tại." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return done(null, false, { message: "Mật khẩu không chính xác." });
        }

        if (!user.is_email_verified) {
          return done(null, false, {
            message: "Tài khoản chưa được xác thực OTP.",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        // Dùng upsert:
        // 1. Tìm user bằng google_id
        // 2. Nếu không thấy, tạo user mới
        // 3. Nếu thấy, cập nhật thông tin (nếu cần)
        // TODO: Xử lý việc khi đã đăng ký nhưng tiếp tục đăng nhập bằng Google.
        const user = await prisma.user.upsert({
          where: { google_id: googleId },
          update: {
            full_name: profile.displayName,
          },
          create: {
            google_id: googleId,
            email: email,
            full_name: profile.displayName,
            role: "Bidder",
            is_email_verified: true,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
