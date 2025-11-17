const productService = require("../services/product.service");

const serializeBigInt = (value, visited = new WeakSet()) => {
  // Xử lý null hoặc undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Xử lý BigInt
  if (typeof value === "bigint") {
    return value.toString();
  }

  // Xử lý Date objects (DateTime từ Prisma) - PHẢI kiểm tra trước Array và Object
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Xử lý Array
  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInt(item, visited));
  }

  // Xử lý Object (nhưng không xử lý null)
  if (typeof value === "object") {
    // Tránh circular reference
    if (visited.has(value)) {
      return "[Circular]";
    }

    // Đánh dấu object đã được visit
    visited.add(value);

    try {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [
          key,
          serializeBigInt(val, visited),
        ]),
      );
    } finally {
      // Không cần remove vì WeakSet tự động cleanup
    }
  }

  return value;
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryIdParam = req.query.categoryId ?? req.query.category;
    const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
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

    const serializedData = serializeBigInt(result.data);

    return res.status(200).json({
      data: serializedData,
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

    // 5. Serialize BigInt trước khi trả về
    const serializedProduct = serializeBigInt(product);

    // 6. Trả về kết quả
    return res.status(200).json({
      data: serializedProduct,
    });
  } catch (error) {
    console.error("Error in getProductById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
