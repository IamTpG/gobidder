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
      // Danh sách bidder bị ban
      banned_bidders: {
        select: {
          bidder_id: true,
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

  // Tạo Set các bidder_id bị ban để filter nhanh
  const bannedBidderIds = new Set(
    product.banned_bidders.map((banned) => banned.bidder_id),
  );

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
    categoryId: product.category?.id || null,
    bidCount: product.bid_count,
    status: product.status,
    autoRenew: product.auto_renew,

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

    // Lịch sử đấu giá - Lọc bỏ các bidder bị ban
    bidHistory: product.bid_histories
      .filter((bid) => !bannedBidderIds.has(bid.user_id))
      .map((bid) => ({
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

  // Chuyển đổi dữ liệu tiền tệ sang Number
  const startPriceNumber = Number(startPrice);
  const stepPriceNumber = Number(stepPrice);
  const buyNowPriceNumber = buyNowPrice ? Number(buyNowPrice) : null;

  // Kiểm tra logic giá
  if (buyNowPriceNumber && buyNowPriceNumber <= startPriceNumber) {
    throw new Error("Buy-now price must be greater than start price");
  }

  // Tạo sản phẩm
  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      images: images, // Prisma hỗ trợ lưu mảng JSON trực tiếp nếu DB là Postgres

      start_price: startPriceNumber,
      step_price: stepPriceNumber,
      buy_now_price: buyNowPriceNumber,
      current_price: 0,

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

/**
 * Cập nhật sản phẩm (Update Product)
 * @param {Int} productId - ID sản phẩm
 * @param {Int} sellerId - ID người bán (để verify quyền)
 * @param {Object} data - Dữ liệu cập nhật
 */
const updateProduct = async (productId, sellerId, data) => {
  // 1. Check if product exists and belongs to seller
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.seller_id !== sellerId) {
    throw new Error("Unauthorized: You are not the seller of this product");
  }

  // 2. Handle Description Append
  let finalDescription = product.description;
  if (data.description && data.description.trim() !== "") {
    const date = new Date();
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    // Format:
    // [Old Description]
    // <br/>
    // <p>✏️ <strong>[Date]</strong></p>
    // [New Description]
    finalDescription = `${product.description}<br/><br/><p>✏️ <strong>${formattedDate}</strong></p><br/>${data.description}`;
  }

  // 3. Update
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      description: finalDescription,
      images: data.images, // Array of URLs
      start_price: data.startPrice,
      step_price: data.stepPrice,
      buy_now_price: data.buyNowPrice,
      category_id: data.categoryId,
      end_time: data.endTime,
      auto_renew: data.autoRenew,
    },
  });

  return updatedProduct;
};

/**
 * Lấy danh sách sản phẩm của seller
 * @param {Int} sellerId - ID của seller
 */
const getSellerProducts = async (sellerId) => {
  const products = await prisma.product.findMany({
    where: { seller_id: sellerId },
    orderBy: { created_at: "desc" },
    include: {
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

/**
 * Append a timestamped description entry to an existing product's description
 * @param {Int} productId
 * @param {Int} sellerId
 * @param {String} newText
 */
const appendDescription = async (productId, sellerId, newText) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { seller_id: true, description: true },
  });

  if (!existingProduct) throw new Error("Product not found");
  if (existingProduct.seller_id !== sellerId)
    throw new Error("You are not authorized to edit this product");

  // Build timestamp in DD/MM/YYYY
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  const entry = `\n\n✏️ ${dateStr}\n\n${newText}`;

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      description: (existingProduct.description || "") + entry,
    },
  });

  return updated;
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
    myMaxBid: product.auto_bids[0]?.max_price || 0,
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
    // Nếu status là "Won", filter các sản phẩm có người thắng đấu giá
    if (status === "Won") {
      where.current_bidder_id = { not: null }; // Có người thắng
      where.end_time = { lte: new Date() }; // Đã hết hạn
      where.status = { not: "Removed" }; // Loại trừ sản phẩm đã bị gỡ
    } else {
      where.status = status;
    }
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

// ========== ADMIN SERVICES ==========

// Lấy tất cả sản phẩm (Admin only - bao gồm tất cả status)
const getAllProductsAdmin = async ({
  page,
  limit,
  categoryId,
  sort,
  q,
  skip,
  status,
}) => {
  const where = {}; // Không filter status mặc định, lấy tất cả

  // Filter theo status nếu có
  if (status) {
    where.status = status;
  }

  if (categoryId) {
    // Lấy tất cả category IDs (parent + children)
    const categoryIds = await categoryService.getAllCategoryIds(categoryId);
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

// Cập nhật sản phẩm (Admin only - có thể sửa bất kỳ sản phẩm nào)
const updateProductAdmin = async (productId, data) => {
  // Kiểm tra product có tồn tại không
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, bid_count: true },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

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
    status,
  } = data;

  // Chuyển đổi giá sang Number
  const startPriceNumber = Number(startPrice);
  const stepPriceNumber = Number(stepPrice);
  const buyNowPriceNumber = buyNowPrice ? Number(buyNowPrice) : null;

  // Validate logic giá
  if (
    buyNowPriceNumber &&
    startPriceNumber &&
    buyNowPriceNumber <= startPriceNumber
  ) {
    throw new Error("Buy-now price must be greater than start price");
  }

  // Validate end_time (nếu có)
  if (endTime && new Date(endTime) <= new Date()) {
    throw new Error("End time must be in the future");
  }

  // Build update data
  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (images) updateData.images = images;
  if (startPriceNumber) updateData.start_price = startPriceNumber;
  if (stepPriceNumber) updateData.step_price = stepPriceNumber;
  if (buyNowPriceNumber !== undefined)
    updateData.buy_now_price = buyNowPriceNumber;
  if (categoryId) updateData.category_id = parseInt(categoryId);
  if (endTime) updateData.end_time = new Date(endTime);
  if (autoRenew !== undefined) updateData.auto_renew = autoRenew;
  if (status) updateData.status = status; // Admin có thể thay đổi status

  // Cập nhật product
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: updateData,
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

  return updatedProduct;
};

// Xóa sản phẩm (Admin only - set status = Removed)
const deleteProductAdmin = async (productId) => {
  // Kiểm tra product có tồn tại không
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // Set status = Removed thay vì xóa thực sự
  const deletedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      status: "Removed",
    },
    include: {
      seller: {
        select: { id: true, full_name: true, email: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
  });

  return deletedProduct;
};

/**
 * Cập nhật trạng thái sản phẩm từ Active sang Expired nếu đã qua thời gian kết thúc
 * Được gọi bởi cron job mỗi phút
 */
const updateExpiredProducts = async () => {
  try {
    const now = new Date();

    // Lấy tất cả sản phẩm Active có end_time đã qua
    const expiredProducts = await prisma.product.findMany({
      where: {
        status: "Active",
        end_time: {
          lt: now, // less than (nhỏ hơn)
        },
      },
      select: { id: true, name: true, seller_id: true },
    });

    if (expiredProducts.length === 0) {
      return {
        success: true,
        message: "No expired products found",
        count: 0,
      };
    }

    // Cập nhật tất cả sản phẩm hết hạn
    const updateResult = await prisma.product.updateMany({
      where: {
        status: "Active",
        end_time: {
          lt: now,
        },
      },
      data: {
        status: "Expired",
      },
    });

    console.log(
      `[Product Service] Updated ${updateResult.count} products to Expired status`,
    );

    // Log chi tiết
    expiredProducts.forEach((product) => {
      console.log(
        `  - Product ID ${product.id} (${product.name}) - Seller ID: ${product.seller_id}`,
      );
    });

    return {
      success: true,
      message: `Successfully updated ${updateResult.count} product(s) to Expired status`,
      count: updateResult.count,
      products: expiredProducts,
    };
  } catch (error) {
    console.error("[Product Service] Error updating expired products:", error);
    throw new Error(`Failed to update expired products: ${error.message}`);
  }
};

/**
 * Kiểm tra và cập nhật trạng thái sản phẩm trước khi trả về
 * Được gọi khi lấy thông tin sản phẩm để đảm bảo real-time
 */
const ensureProductStatusIsValid = async (productId) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true, end_time: true },
    });

    if (!product) return null;

    // Nếu sản phẩm đang Active nhưng đã qua end_time thì cập nhật
    if (product.status === "Active" && product.end_time < new Date()) {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { status: "Expired" },
      });

      console.log(
        `[Product Service] Updated product ${productId} to Expired status (real-time)`,
      );
      return updatedProduct;
    }

    return product;
  } catch (error) {
    console.error(`[Product Service] Error checking product status:`, error);
    return null;
  }
};

module.exports = {
  getProducts,
  getProductById,
  getTopEndingSoon,
  getTopMostBids,
  getTopHighestPrice,
  getRelatedProducts,
  createProduct,
  updateProduct,
  getSellerProducts,
  getAllBiddedProducts,
  getUserActiveBids,
  getUserWonProducts,
  getProductsBySellerId,
  appendDescription,
  getAllProductsAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  updateExpiredProducts,
  ensureProductStatusIsValid,
};
