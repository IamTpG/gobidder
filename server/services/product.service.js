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
      { name: { equals: searchTerm, mode: "insensitive" } },
      { name: { startsWith: searchTerm + " ", mode: "insensitive" } },
      { name: { endsWith: " " + searchTerm, mode: "insensitive" } },
      { name: { contains: " " + searchTerm + " ", mode: "insensitive" } },
      { description: { equals: searchTerm, mode: "insensitive" } },
      { description: { startsWith: searchTerm + " ", mode: "insensitive" } },
      { description: { endsWith: " " + searchTerm, mode: "insensitive" } },
      {
        description: { contains: " " + searchTerm + " ", mode: "insensitive" },
      },
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
    case "end_time_asc":
      orderBy = { end_time: "asc" };
      break;
    case "end_time_desc":
      orderBy = { end_time: "desc" };
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

exports.getProductById = async (productId) => {
  // Query chi tiết sản phẩm với tất cả thông tin liên quan
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      // Thông tin người bán
      seller: {
        select: {
          id: true,
          full_name: true,
          email: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
      // Thông tin danh mục
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      // Thông tin người đấu giá cao nhất hiện tại
      current_bidder: {
        select: {
          id: true,
          full_name: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
      // Lịch sử đấu giá (sắp xếp theo thời gian mới nhất)
      bid_histories: {
        orderBy: {
          created_at: "desc",
        },
        take: 10, // Lấy 10 lượt đấu giá gần nhất
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
            },
          },
        },
      },
      // Q&A (Câu hỏi và trả lời)
      qna_items: {
        orderBy: {
          question_time: "desc",
        },
        include: {
          questioner: {
            select: {
              id: true,
              full_name: true,
              rating_plus: true,
              rating_minus: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  // Transform data để khớp với Frontend format
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    fullDescription: product.description, // Frontend cần fullDescription
    currentBid: parseFloat(product.current_price),
    buyNowPrice: product.buy_now_price
      ? parseFloat(product.buy_now_price)
      : null,
    startPrice: parseFloat(product.start_price),
    stepPrice: parseFloat(product.step_price),
    auctionEndDate: product.end_time,
    createdAt: product.created_at,
    timezone: "UTC 0", // Mặc định
    category: product.category?.name || "Uncategorized",
    bidCount: product.bid_count,
    status: product.status,

    // Thông tin người bán
    seller: {
      id: product.seller.id,
      name: product.seller.full_name,
      email: product.seller.email,
      ratingPlus: product.seller.rating_plus,
      ratingMinus: product.seller.rating_minus,
    },

    // Thông tin người đấu giá cao nhất
    currentBidder: product.current_bidder
      ? {
          id: product.current_bidder.id,
          name: product.current_bidder.full_name,
          ratingPlus: product.current_bidder.rating_plus,
          ratingMinus: product.current_bidder.rating_minus,
        }
      : null,

    // Images (parse JSON)
    images: Array.isArray(product.images)
      ? product.images
      : typeof product.images === "string"
        ? JSON.parse(product.images)
        : [],

    // Lịch sử đấu giá
    bidHistory: product.bid_histories.map((bid) => ({
      id: bid.id,
      date: bid.created_at,
      amount: parseFloat(bid.bid_price),
      user: bid.user.full_name,
      userId: bid.user.id,
    })),

    // Q&A
    qnaItems: product.qna_items.map((qna) => ({
      id: qna.id,
      questionText: qna.question_text,
      questionTime: qna.question_time,
      questionerId: qna.questioner_id,
      questioner: {
        id: qna.questioner.id,
        fullName: qna.questioner.full_name,
        ratingPlus: qna.questioner.rating_plus,
        ratingMinus: qna.questioner.rating_minus,
      },
      answerText: qna.answer_text,
      answerTime: qna.answer_time,
    })),
  };
};
