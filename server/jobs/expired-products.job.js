const cron = require("node-cron");
const productService = require("../services/product.service");

/**
 * Cron Job: Cập nhật trạng thái sản phẩm từ Active sang Expired
 * Chạy mỗi phút (định kỳ) để kiểm tra sản phẩm nào đã hết hạn
 */
const scheduleExpiredProductsUpdate = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await productService.updateExpiredProducts();

      if (result.count > 0) {
        console.log(`[CRON] ${result.message}`);
      }
      // Nếu không có sản phẩm hết hạn thì không log để tránh spam
    } catch (error) {
      console.error("[CRON] Error in expired products job:", error.message);
    }
  });

  console.log(
    "[CRON] Expired products update job scheduled (runs every minute)",
  );
};

module.exports = { scheduleExpiredProductsUpdate };
