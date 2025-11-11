const productService = require("../services/product.service");

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.category ? req.query.category : null;
    const sort = req.query.sort || "created_at";
    const q = req.query.q || "";

    const maxLimit = 50;
    const validateLimit = min(limit, maxLimit);
    const validatePage = max(page, 1);
    const skip = (validatePage - 1) * validateLimit;

    const result = await productService.getProducts({
      page: validatePage,
      limit: validateLimit,
      categoryId,
      sort,
      q,
      skip,
    });

    return res.status(200).json({
      data: result.data,
      pagination: {
        page: validatePage,
        limit: validateLimit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
