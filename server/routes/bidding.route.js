const express = require("express");
const passport = require("passport");

const biddingController = require("../controllers/bidding.controller");

const router = express.Router();

// Đặt giá
router.post(
  "/products/:id/bid",
  passport.authenticate("jwt", { session: false }),
  biddingController.placeBid,
);

module.exports = router;
