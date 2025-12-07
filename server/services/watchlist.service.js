const prisma = require("../config/prisma");

/**
 * Get all watchlist items for a user
 * @param {Int} userId - ID of the user
 */
const getUserWatchlist = async (userId) => {
  const watchlistItems = await prisma.watchList.findMany({
    where: {
      user_id: userId,
    },
    include: {
      product: {
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
      },
    },
    orderBy: {
      product: {
        created_at: "desc",
      },
    },
  });

  // Transform to match frontend format
  return watchlistItems.map((item) => item.product);
};

/**
 * Add a product to user's watchlist
 * @param {Int} userId - ID of the user
 * @param {Int} productId - ID of the product
 */
const addToWatchlist = async (userId, productId) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check if already in watchlist
  const existing = await prisma.watchList.findUnique({
    where: {
      user_id_product_id: {
        user_id: userId,
        product_id: productId,
      },
    },
  });

  if (existing) {
    throw new Error("Product already in watchlist");
  }

  // Add to watchlist
  const watchlistItem = await prisma.watchList.create({
    data: {
      user_id: userId,
      product_id: productId,
    },
  });

  return watchlistItem;
};

/**
 * Remove a product from user's watchlist
 * @param {Int} userId - ID of the user
 * @param {Int} productId - ID of the product
 */
const removeFromWatchlist = async (userId, productId) => {
  // Check if exists in watchlist
  const existing = await prisma.watchList.findUnique({
    where: {
      user_id_product_id: {
        user_id: userId,
        product_id: productId,
      },
    },
  });

  if (!existing) {
    throw new Error("Product not in watchlist");
  }

  // Remove from watchlist
  await prisma.watchList.delete({
    where: {
      user_id_product_id: {
        user_id: userId,
        product_id: productId,
      },
    },
  });

  return { message: "Removed from watchlist" };
};

/**
 * Check if a product is in user's watchlist
 * @param {Int} userId - ID of the user
 * @param {Int} productId - ID of the product
 */
const isInWatchlist = async (userId, productId) => {
  const watchlistItem = await prisma.watchList.findUnique({
    where: {
      user_id_product_id: {
        user_id: userId,
        product_id: productId,
      },
    },
  });

  return !!watchlistItem;
};

/**
 * Toggle watchlist status (add if not exists, remove if exists)
 * @param {Int} userId - ID of the user
 * @param {Int} productId - ID of the product
 */
const toggleWatchlist = async (userId, productId) => {
  const existing = await prisma.watchList.findUnique({
    where: {
      user_id_product_id: {
        user_id: userId,
        product_id: productId,
      },
    },
  });

  if (existing) {
    // Remove from watchlist
    await prisma.watchList.delete({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });
    return { isInWatchlist: false, message: "Removed from watchlist" };
  } else {
    // Add to watchlist
    await prisma.watchList.create({
      data: {
        user_id: userId,
        product_id: productId,
      },
    });
    return { isInWatchlist: true, message: "Added to watchlist" };
  }
};

module.exports = {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  toggleWatchlist,
};
