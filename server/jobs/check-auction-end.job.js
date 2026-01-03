const cron = require("node-cron");
const prisma = require("../config/prisma");
const { sendMail } = require("../utils/utils");

const checkAndProcessEndedAuctions = async () => {
  // console.log("[CRON] Checking for ended auctions...");
  try {
    const now = new Date();

    // Find active products that have ended
    const endedProducts = await prisma.product.findMany({
      where: {
        status: "Active",
        end_time: {
          lte: now,
        },
      },
      include: {
        seller: true,
        current_bidder: true,
      },
    });

    if (endedProducts.length > 0) {
      console.log(`[CRON] Found ${endedProducts.length} ended auctions.`);
    }

    for (const product of endedProducts) {
      // Case 1: No bids => Expired, email Seller
      if (!product.current_bidder_id) {
        console.log(
          `[CRON] Product ${product.id} ended with no bids. Sending email to seller.`,
        );

        // Update status to Expired
        await prisma.product.update({
          where: { id: product.id },
          data: { status: "Expired" },
        });

        // Send Email
        await sendMail({
          to: product.seller.email,
          subject: "Auction Ended - No Bids",
          text: `Hello ${product.seller.full_name},\n\nYour auction for "${product.name}" has ended with no bids.\n\nRegards,\nGoBidder Team`,
          html: `<p>Hello <strong>${product.seller.full_name}</strong>,</p><p>Your auction for "<strong>${product.name}</strong>" has ended with no bids.</p><p>Regards,<br>GoBidder Team</p>`,
        });
      }
      // Case 2: Has bids => Won
      else {
        console.log(
          `[CRON] Product ${product.id} ended with winner ${product.current_bidder_id}. Updating to Won.`,
        );

        await prisma.product.update({
          where: { id: product.id },
          data: { status: "Won" },
        });

        await sendMail({
          to: product.seller.email,
          subject: "Auction Ended - There is a winner",
          text: `Hello ${product.seller.full_name},\n\nYour auction for "${product.name}" has ended with winner ${product.current_bidder.full_name}.\n\nRegards,\nGoBidder Team`,
          html: `<p>Hello <strong>${product.seller.full_name}</strong>,</p><p>Your auction for "<strong>${product.name}</strong>" has ended with winner ${product.current_bidder.full_name}.</p><p>Regards,<br>GoBidder Team</p>`,
        });

        await sendMail({
          to: product.current_bidder.email,
          subject: "Auction Ended - You are the winner",
          text: `Hello ${product.current_bidder.full_name},\n\nYour auction for "${product.name}" has ended and you are the winner.\n\nRegards,\nGoBidder Team`,
          html: `<p>Hello <strong>${product.current_bidder.full_name}</strong>,</p><p>Your auction for "<strong>${product.name}</strong>" has ended and you are the winner.</p><p>Regards,<br>GoBidder Team</p>`,
        });
      }
    }
  } catch (error) {
    console.error("[CRON] Error in auction end check:", error);
  }
};

const scheduleAuctionEndCheck = () => {
  // Run every minute
  cron.schedule("* * * * *", checkAndProcessEndedAuctions);
};

module.exports = { scheduleAuctionEndCheck, checkAndProcessEndedAuctions };
