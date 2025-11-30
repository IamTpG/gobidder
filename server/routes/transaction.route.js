const express = require("express");
const passport = require("passport");
const { authorizeRoles } = require("../middlewares/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

// Create transaction for product (idempotent)
router.post(
  "/create-for-product/:productId",
  passport.authenticate("jwt", { session: false }),
  transactionController.createForProduct,
);

// Get transaction by product ID
router.get(
  "/product/:productId",
  passport.authenticate("jwt", { session: false }),
  transactionController.getByProduct,
);

// Get transaction by id
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  transactionController.getById,
);

// Buyer uploads payment proof
router.post(
  "/:id/payment",
  passport.authenticate("jwt", { session: false }),
  transactionController.postPayment,
);

// Seller confirms shipping
router.post(
  "/:id/shipping",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  transactionController.postShipping,
);

// Buyer confirms receipt
router.post(
  "/:id/confirm-receipt",
  passport.authenticate("jwt", { session: false }),
  transactionController.postConfirmReceipt,
);

// Seller cancels transaction
router.post(
  "/:id/cancel",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("Seller"),
  transactionController.postCancel,
);

// Chat messages
router.get(
  "/:id/messages",
  passport.authenticate("jwt", { session: false }),
  transactionController.getMessages,
);

router.post(
  "/:id/messages",
  passport.authenticate("jwt", { session: false }),
  transactionController.postMessage,
);

// Ratings
router.post(
  "/:id/rating",
  passport.authenticate("jwt", { session: false }),
  transactionController.postRating,
);

module.exports = router;
