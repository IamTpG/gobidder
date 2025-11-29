const prisma = require('../config/prisma');

exports.updateSystemConfig = async (req, res) => {
  try {
    const { highlight_duration, anti_sniping_trigger, anti_sniping_extension } = req.body;

    const config = await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: {
        new_product_duration: parseInt(highlight_duration),
        anti_sniping_trigger: parseInt(anti_sniping_trigger),
        anti_sniping_extension: parseInt(anti_sniping_extension),
      },
      create: {
        id: 1,
        new_product_duration: parseInt(highlight_duration),
        anti_sniping_trigger: parseInt(anti_sniping_trigger),
        anti_sniping_extension: parseInt(anti_sniping_extension),
      },
    });

    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("Update config error:", error);
    return res.status(500).json({ error: "Lỗi server khi lưu cấu hình" });
  }
};

exports.getSystemConfig = async (req, res) => {
  try {
    const config = await prisma.systemConfig.findFirst({ where: { id: 1 } });
    if (!config) {
      return res.json({ 
        new_product_duration: 60, 
        anti_sniping_trigger: 5, 
        anti_sniping_extension: 3 
      });
    }
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ error: "Lỗi lấy cấu hình" });
  }
};