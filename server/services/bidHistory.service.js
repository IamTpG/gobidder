const prisma = require("../config/prisma");

// Lấy tất cả lịch sử đấu giá với filter và phân trang
const getAllBidHistory = async (options) => {
  const { page, limit, productId, userId } = options;

  const skip = (page - 1) * limit;

  const where = {};
  if (productId) where.product_id = productId;
  if (userId) where.user_id = userId;

  // Lấy tổng số records
  const total = await prisma.bidHistory.count({ where });

  // Lấy danh sách
  const bidHistories = await prisma.bidHistory.findMany({
    where,
    select: {
      id: true,
      bid_price: true,
      created_at: true,
      product: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      user: {
        select: {
          id: true,
          full_name: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    skip,
    take: limit,
  });

  // Format response
  const formattedData = bidHistories.map((item) => ({
    id: item.id,
    bid_price: item.bid_price.toString(),
    created_at: item.created_at,
    product: item.product,
    bidder: item.user,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    data: formattedData,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_records: total,
      limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
};

// Lấy một lịch sử đấu giá theo ID
const getBidHistoryById = async (id) => {
  const bidHistoryId = parseInt(id);
  if (isNaN(bidHistoryId)) {
    throw new Error("Invalid bid history ID");
  }

  const bidHistory = await prisma.bidHistory.findUnique({
    where: { id: bidHistoryId },
    select: {
      id: true,
      bid_price: true,
      created_at: true,
      product: {
        select: {
          id: true,
          name: true,
          status: true,
          current_price: true,
        },
      },
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
    },
  });

  if (!bidHistory) {
    throw new Error("Bid history not found");
  }

  return {
    id: bidHistory.id,
    bid_price: bidHistory.bid_price.toString(),
    created_at: bidHistory.created_at,
    product: {
      ...bidHistory.product,
      current_price: bidHistory.product.current_price.toString(),
    },
    bidder: bidHistory.user,
  };
};

// Lấy lịch sử đấu giá theo sản phẩm (2.3)
const getBidHistoryByProduct = async (productId, options) => {
  const { page, limit, order } = options;

  const id = parseInt(productId);
  if (isNaN(id)) {
    throw new Error("Invalid product ID");
  }

  // Kiểm tra sản phẩm có tồn tại
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      bid_count: true,
      current_price: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const skip = (page - 1) * limit;

  const total = await prisma.bidHistory.count({
    where: { product_id: id },
  });

  const bidHistories = await prisma.bidHistory.findMany({
    where: { product_id: id },
    select: {
      id: true,
      bid_price: true,
      created_at: true,
      user: {
        select: {
          id: true,
          full_name: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
    },
    orderBy: {
      created_at: order,
    },
    skip,
    take: limit,
  });

  const formattedBids = bidHistories.map((bid) => ({
    id: bid.id,
    bid_price: bid.bid_price.toString(),
    bidder: bid.user,
    created_at: bid.created_at,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    product: {
      ...product,
      current_price: product.current_price.toString(),
    },
    bids: formattedBids,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_bids: total,
      limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
};

// Lấy lịch sử đấu giá theo người dùng
const getBidHistoryByUser = async (userId, options) => {
  const { page, limit, order } = options;

  const id = parseInt(userId);
  if (isNaN(id)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const total = await prisma.bidHistory.count({
    where: { user_id: id },
  });

  const bidHistories = await prisma.bidHistory.findMany({
    where: { user_id: id },
    select: {
      id: true,
      bid_price: true,
      created_at: true,
      product: {
        select: {
          id: true,
          name: true,
          status: true,
          current_price: true,
          end_time: true,
        },
      },
    },
    orderBy: {
      created_at: order,
    },
    skip,
    take: limit,
  });

  const formattedBids = bidHistories.map((bid) => ({
    id: bid.id,
    bid_price: bid.bid_price.toString(),
    product: {
      ...bid.product,
      current_price: bid.product.current_price.toString(),
    },
    created_at: bid.created_at,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    bids: formattedBids,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_bids: total,
      limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
};

// Tạo một bản ghi lịch sử đấu giá mới
const createBidHistory = async (data) => {
  const { product_id, user_id, bid_price } = data;

  // Validate bid_price
  if (bid_price <= 0) {
    throw new Error("Invalid bid price");
  }

  // Kiểm tra product tồn tại
  const product = await prisma.product.findUnique({
    where: { id: product_id },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Kiểm tra user tồn tại
  const user = await prisma.user.findUnique({
    where: { id: user_id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Tạo bid history
  const bidHistory = await prisma.bidHistory.create({
    data: {
      product_id,
      user_id,
      bid_price,
    },
    select: {
      id: true,
      bid_price: true,
      created_at: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          full_name: true,
        },
      },
    },
  });

  return {
    id: bidHistory.id,
    bid_price: bidHistory.bid_price.toString(),
    created_at: bidHistory.created_at,
    product: bidHistory.product,
    bidder: bidHistory.user,
  };
};

// Xóa một bản ghi lịch sử đấu giá
const deleteBidHistory = async (id) => {
  const bidHistoryId = parseInt(id);
  if (isNaN(bidHistoryId)) {
    throw new Error("Invalid bid history ID");
  }

  // Kiểm tra tồn tại
  const existing = await prisma.bidHistory.findUnique({
    where: { id: bidHistoryId },
  });

  if (!existing) {
    throw new Error("Bid history not found");
  }

  // Xóa
  await prisma.bidHistory.delete({
    where: { id: bidHistoryId },
  });

  return {
    message: "Bid history deleted successfully",
    id: bidHistoryId,
  };
};

module.exports = {
  getAllBidHistory,
  getBidHistoryById,
  getBidHistoryByProduct,
  getBidHistoryByUser,
  createBidHistory,
  deleteBidHistory,
};
