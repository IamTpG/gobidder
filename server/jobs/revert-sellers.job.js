const cron = require("node-cron");
const userService = require("../services/user.service");

// Run every hour
const scheduleSellerReversion = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Running seller reversion job...");
    try {
      const result = await userService.revertExpiredSellers();
      console.log("[CRON] Seller reversion completed:", result.message);
      if (result.count > 0) {
        console.log(
          `[CRON] Reverted ${result.count} seller(s) back to bidder status`
        );
      }
    } catch (error) {
      console.error("[CRON] Error running seller reversion:", error);
    }
  });
  console.log("[CRON] Seller reversion job scheduled (runs every hour)");
};

module.exports = { scheduleSellerReversion };
