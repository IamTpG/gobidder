const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");

const { cookieExtractor } = require("../utils/utils");

const prisma = require("../config/prisma");

const jwtCookieExtractor = (req) => {
  return cookieExtractor(req, "access_token");
};

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([jwtCookieExtractor]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.id },
        });

        if (!user) {
          return done(null, false);
        }

        if (user.role === "Banned") {
          return done(null, false, { message: "Account is banned" });
        }

        return done(null, user);
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

        console.log(user);

        if (!user) {
          return done(null, false, {
            message: "Email address does not exist.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        if (!user.is_email_verified) {
          return done(null, false, {
            message: "The account has not been verified with OTP.",
          });
        }

        if (user.role === "Banned") {
          return done(null, false, {
            message: "Your account has been banned.",
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

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          if (existingUser.role === "Banned") {
            return done(null, false, {
              message: "banned",
            });
          }
          if (!existingUser.google_id) {
            const updatedUser = await prisma.user.update({
              where: { email },
              data: { google_id: googleId, is_email_verified: true },
            });
            return done(null, updatedUser);
          }
          return done(null, existingUser);
        }

        const newUser = await prisma.user.create({
          data: {
            google_id: googleId,
            email: email,
            full_name: profile.displayName,
            role: "Bidder",
            is_email_verified: true,
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
