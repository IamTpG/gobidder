const prisma = require("../config/prisma");
const categoryService = require("./category.service");

exports.getProducts = async ({ page, limit, categoryId, sort, q, skip }) => {
  const where = {
    status: "Active",
  };

  if (categoryId) {
    // Lấy tất cả category IDs (parent + children)
    const categoryIds = await categoryService.getAllCategoryIds(categoryId);
    // Filter products có category_id trong danh sách này
    where.category_id = { in: categoryIds };
  }

  const searchTerm = q?.trim();
  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  let orderBy;
  switch (sort) {
    case "price_asc":
      orderBy = { current_price: "asc" };
      break;
    case "price_desc":
      orderBy = { current_price: "desc" };
      break;
    case "end_time":
      orderBy = { end_time: "asc" };
      break;
    case "bid_count":
      orderBy = { bid_count: "desc" };
      break;
    case "created_at":
    default:
      orderBy = { created_at: "desc" };
  }

  const products = await prisma.product.findMany({
    where,
    skip,
    orderBy,
    take: limit,
    include: {
      seller: {
        select: { id: true, full_name: true, email: true },
      },
      category: {
        select: { id: true, name: true },
      },
      current_bidder: {
        select: { id: true, full_name: true },
      },
    },
  });

  const totalItems = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalItems / limit);

  const response = {
    data: products,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return response;
};
