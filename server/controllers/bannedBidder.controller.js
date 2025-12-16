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
        console.log(
          `[BAN] Sending ban notification to ${bidder.email} for product ${product.name}`
        );

        const subject = `Notification: You have been banned from "${product.name}"`;
        const text = `Dear ${bidder.full_name},\n\nWe are writing to inform you that the seller has banned you from bidding on the auction for "${product.name}".\n\nAs a result, your existing bids on this product have been removed, and you will not be able to place further bids on this item.\n\nIf you believe this is a mistake, please contact the seller directly or reach out to our support team.\n\nBest regards,\nGoBidder Team`;
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #EF4444; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 24px;">Auction Ban Notification</h2>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #333;">Dear <strong>${bidder.full_name}</strong>,</p>
              
              <p style="font-size: 16px; color: #333; line-height: 1.5;">
                We are writing to inform you that the seller has banned you from bidding on the auction for:
              </p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #EF4444;">
                <p style="margin: 0; font-weight: bold; font-size: 18px; color: #111;">${product.name}</p>
              </div>
              
              <p style="font-size: 16px; color: #333; line-height: 1.5;">
                As a result, <strong>your existing bids on this product have been removed</strong>, and you will not be able to place further bids on this item.
              </p>
              
              <p style="font-size: 16px; color: #333; line-height: 1.5;">
                If you believe this is a mistake, please contact the seller directly or reach out to our support team.
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="color: #666; font-size: 14px; text-align: center;">
                Best regards,<br>
                <strong>GoBidder Team</strong>
              </p>
            </div>
          </div>
        `;

        await sendMail({
          to: bidder.email,
          subject: subject,
          text: text,
          html: html,
        });
        console.log(`[BAN] Email sent successfully to ${bidder.email}`);
      } catch (emailError) {
        console.error(
          "[BAN] Failed to send ban notification email:",
          emailError
        );
        // Don't fail the request if email fails, but log it clearly
      }
    } else {
      console.warn(
        "[BAN] Missing bidder email or product info, skipping email."
      );
    }

    return res.status(200).json({
      message: "Bidder banned successfully and notified via email",
      data: result,
    });
  } catch (error) {
    console.error("Error in banBidder:", error);

    if (
      error.message === "Product not found" ||
      error.message === "This bidder has not placed any bids on this product"
    ) {
      return res.status(404).json({ message: error.message });
    }

    if (
      error.message ===
        "Unauthorized: You are not the seller of this product" ||
      error.message === "Cannot ban bidder from non-active auction" ||
      error.message === "This bidder is already banned from this product"
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
