const prisma = require("../config/prisma");

exports.getProducts = async ({ params }) => {
  const { page, limit, categoryId, sort, q, skip } = params;

  const where = {
    status: "Active",
  };

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insentative" } },
    ];
  }

  let orderBy = {};
  switch (sort) {
    case "price-asc":
      orderBy = { current_price: "asc" };
      break;
    case "price-desc":
      orderBy = { current_price: "desc" };
      break;
    case "end_time":
      orderBy = { end_time: "asc" };
      break;
    case "bid_count":
      orderBy = { bid_count: "desc" };
      break;
    default:
      orderBy = { created_ad: "desc" };
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
      current_bid: {
        select: { id: true, full_name },
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
