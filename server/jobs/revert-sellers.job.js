const cron = require("node-cron");
const userService = require("../services/user.service");

// Run every minute (for testing 2-minute trial period)
const scheduleSellerReversion = () => {
  cron.schedule("* * * * *", async () => {
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
  console.log(
    "[CRON] Seller reversion job scheduled (runs every minute for testing)"
  );
};

module.exports = { scheduleSellerReversion };
