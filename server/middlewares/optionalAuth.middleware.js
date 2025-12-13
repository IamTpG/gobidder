const passport = require("passport");

//Nhận diện winner và seller để hiển thị phần rating

const optionalAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    // If error or no user, just call next() without user
    if (err || !user) {
      return next();
    }
    // If user found, attach to req and next
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = optionalAuth;
