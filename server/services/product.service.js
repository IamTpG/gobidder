const prisma = require("../config/prisma");
const categoryService = require("./category.service");

// Lấy tất cả sản phẩm
const getProducts = async ({ page, limit, categoryId, sort, q, skip }) => {
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

// Lấy một sản phẩm
const getProductById = async (productId) => {
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

// Top 5 sản phẩm gần kết thúc
const getTopEndingSoon = async () => {
  const products = await prisma.product.findMany({
    where: {
      status: "Active",
      end_time: {
        gt: new Date(), // Chỉ lấy sản phẩm chưa kết thúc
      },
    },
    orderBy: {
      end_time: "asc", // Sắp xếp theo thời gian kết thúc gần nhất
    },
    take: 5,
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

  return products;
};

// Top 5 sản phẩm có nhiều lượt ra giá nhất
const getTopMostBids = async () => {
  const products = await prisma.product.findMany({
    where: {
      status: "Active",
    },
    orderBy: {
      bid_count: "desc", // Sắp xếp theo số lượt đấu giá giảm dần
    },
    take: 5,
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

  return products;
};

// Top 5 sản phẩm có giá cao nhất
const getTopHighestPrice = async () => {
  const products = await prisma.product.findMany({
    where: {
      status: "Active",
    },
    orderBy: {
      current_price: "desc", // Sắp xếp theo giá hiện tại giảm dần
    },
    take: 5,
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

  return products;
};

// Lấy sản phẩm liên quan (cùng category_id)
const getRelatedProducts = async (productId, limit = 5) => {
  // Lấy product để biết category_id
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { category_id: true },
  });

  if (!product) return [];

  // Tìm các sản phẩm khác có cùng category_id
  const related = await prisma.product.findMany({
    where: {
      id: { not: productId },
      category_id: product.category_id,
      status: "Active",
    },
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      seller: { select: { id: true, full_name: true, email: true } },
      category: { select: { id: true, name: true, parent_id: true } },
      current_bidder: { select: { id: true, full_name: true } },
    },
  });

  return related;
};

/**
 * Tạo sản phẩm mới (Create Product)
 * @param {Int} sellerId - ID của người bán
 * @param {Object} data - Dữ liệu sản phẩm
 */
const createProduct = async (sellerId, data) => {
  const {
    name,
    description,
    images,
    startPrice,
    stepPrice,
    buyNowPrice,
    categoryId,
    endTime,
    autoRenew,
  } = data;

  // Chuyển đổi dữ liệu tiền tệ sang BigInt
  const startPriceBigInt = BigInt(startPrice);
  const stepPriceBigInt = BigInt(stepPrice);
  const buyNowPriceBigInt = buyNowPrice ? BigInt(buyNowPrice) : null;

  // Kiểm tra logic giá
  if (buyNowPriceBigInt && buyNowPriceBigInt <= startPriceBigInt) {
    throw new Error("Buy-now price must be greater than start price");
  }

  // Tạo sản phẩm
  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      images: images, // Prisma hỗ trợ lưu mảng JSON trực tiếp nếu DB là Postgres

      start_price: startPriceBigInt,
      step_price: stepPriceBigInt,
      buy_now_price: buyNowPriceBigInt,
      current_price: 0n,

      auto_renew: autoRenew || false,
      status: "Active",

      seller_id: sellerId,
      category_id: parseInt(categoryId),

      created_at: new Date(),
      end_time: new Date(endTime),
    },
  });

  return newProduct;
};

// Lấy tất cả sản phẩm cá nhân có đấu giá
const getAllBiddedProducts = async (userId) => {
  const allBids = await prisma.autoBid.findMany({
    where: { user_id: userId },
    include: {
      product: {
        include: {
          seller: { select: { full_name: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return allBids.map((item) => {
    const product = item.product;
    const isEnded = new Date() > new Date(product.end_time);
    const isWinner = product.current_bidder_id === userId && isEnded;

    return {
      productId: product.id,
      productName: product.name,
      image: Array.isArray(product.images) ? product.images[0] : null,
      sellerName: product.seller.full_name,
      endTime: product.end_time,
      currentPrice: product.current_price,
      myMaxBid: item.max_price,
      status: isWinner ? "Won" : !isEnded ? "Active" : "Ended",
      isLeading: product.current_bidder_id === userId,
    };
  });
};

// Lấy tất cả sản phẩm cá nhân đang đấu giá
const getUserActiveBids = async (userId) => {
  const activeBids = await prisma.autoBid.findMany({
    where: {
      user_id: userId,
      product: {
        end_time: { gt: new Date() }, // Chưa hết hạn
        status: { not: "Removed" }, // Chưa bị gỡ
      },
    },
    include: {
      product: {
        include: { seller: { select: { full_name: true } } },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return activeBids.map((item) => {
    const product = item.product;
    return {
      productId: product.id,
      productName: product.name,
      image: Array.isArray(product.images) ? product.images[0] : null,
      sellerName: product.seller.full_name,
      endTime: product.end_time,
      currentPrice: product.current_price,
      myMaxBid: item.max_price,
      status: "Active",
      isLeading: product.current_bidder_id === userId,
    };
  });
};

// Lấy tất cả sản phẩm cá nhân đã thắng đấu giá
const getUserWonProducts = async (userId) => {
  const wonProducts = await prisma.product.findMany({
    where: {
      current_bidder_id: userId,
      end_time: { lte: new Date() }, // Đã hết hạn
    },
    include: {
      seller: { select: { full_name: true, email: true } },
      // Join để lấy giá max mình từng đặt
      auto_bids: {
        where: { user_id: userId },
        select: { max_price: true },
      },
    },
    orderBy: { end_time: "desc" },
  });

  return wonProducts.map((product) => ({
    productId: product.id,
    productName: product.name,
    image: Array.isArray(product.images) ? product.images[0] : null,
    sellerName: product.seller.full_name,
    endTime: product.end_time,
    finalPrice: product.current_price,
    myMaxBid: product.auto_bids[0]?.max_price || 0n,
    status: "Won",
  }));
};

// Lấy danh sách sản phẩm của seller với pagination và filters
const getProductsBySellerId = async ({
  sellerId,
  page,
  limit,
  categoryId,
  sort,
  q,
  skip,
  status,
}) => {
  const where = {
    seller_id: sellerId,
  };

  // Filter theo status nếu có (mặc định lấy tất cả)
  if (status) {
    where.status = status;
  }

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

module.exports = {
  getProducts,
  getProductById,
  getTopEndingSoon,
  getTopMostBids,
  getTopHighestPrice,
  getRelatedProducts,
  createProduct,
  getAllBiddedProducts,
  getUserActiveBids,
  getUserWonProducts,
  getProductsBySellerId,
};
