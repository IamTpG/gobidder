const bannedBidderService = require("../services/bannedBidder.service");
const { sendMail } = require("../utils/utils");
const prisma = require("../config/prisma");

/**
 * Ban a bidder from a specific product
 * POST /api/products/:id/ban-bidder
 */
const banBidder = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { bidderId } = req.body;
    const sellerId = req.user.id;

    if (!bidderId) {
      return res.status(400).json({ message: "Bidder ID is required" });
    }

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (typeof bidderId !== "number" || bidderId <= 0) {
      return res.status(400).json({ message: "Invalid bidder ID" });
    }

    // Ban the bidder
    const result = await bannedBidderService.banBidderFromProduct(
      productId,
      bidderId,
      sellerId
    );

    // Get bidder info and product info for email
    const bidder = await prisma.user.findUnique({
      where: { id: bidderId },
      select: { email: true, full_name: true },
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    // Send email notification to banned bidder
    if (bidder && bidder.email && product) {
      try {
        await sendMail({
          to: bidder.email,
          subject: "You have been rejected from an auction - GoBidder",
          text: `Dear ${bidder.full_name},\n\nYou have been rejected from bidding on the product "${product.name}".\n\nYou will no longer be able to place bids on this product.\n\nBest regards,\nGoBidder Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #01AA85;">Auction Rejected Notification</h2>
              <p>Dear ${bidder.full_name},</p>
              <p>You have been rejected from bidding on the product:</p>
              <p style="font-weight: bold; font-size: 16px; margin: 20px 0;">"${product.name}"</p>
              <p>You will no longer be able to place bids on this product.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">Best regards,<br>GoBidder Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error(
          "Failed to send rejected notification email:",
          emailError
        );
        // Don't fail the request if email fails
      }
    }

    return res.status(200).json({
      message: "Bidder rejected successfully and notified via email",
      data: result,
    });
  } catch (error) {
    console.error("Error in rejectBidder:", error);

    if (
      error.message === "Product not found" ||
      error.message === "This bidder has not placed any bids on this product"
    ) {
      return res.status(404).json({ message: error.message });
    }

    if (
      error.message ===
        "Unauthorized: You are not the seller of this product" ||
      error.message === "Cannot reject bidder from non-active auction" ||
      error.message === "This bidder is already rejected from this product"
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Check if current user is banned from a product
 * GET /api/products/:id/banned-status
 */
const checkBannedStatus = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const isBanned = await bannedBidderService.isBidderBanned(
      productId,
      userId
    );

    return res.status(200).json({ isBanned });
  } catch (error) {
    console.error("Error in checkBannedStatus:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all banned bidders for a product (seller only)
 * GET /api/products/:id/banned-bidders
 */
const getBannedBidders = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const sellerId = req.user.id;

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Verify seller owns this product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { seller_id: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller_id !== sellerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not the seller" });
    }

    const bannedBidders = await bannedBidderService.getBannedBidders(productId);

    return res.status(200).json({ data: bannedBidders });
  } catch (error) {
    console.error("Error in getBannedBidders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  banBidder,
  checkBannedStatus,
  getBannedBidders,
};
