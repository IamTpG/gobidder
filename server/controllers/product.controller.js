const productService = require("../services/product.service");

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.category ? req.query.category : null;
    const sort = req.query.sort || "created_at";
    const q = req.query.q || "";

    const maxLimit = 50;
    const validateLimit = Math.min(limit, maxLimit);
    const validatePage = Math.max(page, 1);
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

exports.getProductById = async (req, res) => {
  try {
    // 1. Lấy ID từ URL params
    const productId = parseInt(req.params.id);

    // 2. Validate ID
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // 3. Gọi service để lấy dữ liệu
    const product = await productService.getProductById(productId);

    // 4. Kiểm tra nếu không tìm thấy sản phẩm
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 5. Trả về kết quả
    return res.status(200).json({
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
