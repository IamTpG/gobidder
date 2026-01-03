const prisma = require("../config/prisma");

/**
 * Ban a bidder from a specific product
 * @param {number} productId - Product ID
 * @param {number} bidderId - Bidder ID to ban
 * @param {number} sellerId - Seller ID (for verification)
 * @returns {object} Updated product info
 */
const banBidderFromProduct = async (productId, bidderId, sellerId) => {
  // 1. Verify product exists and seller owns it
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      current_bidder: {
        select: { id: true, full_name: true, email: true },
      },
      bid_histories: {
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: { id: true, full_name: true, email: true },
          },
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.seller_id !== sellerId) {
    throw new Error("Unauthorized: You are not the seller of this product");
  }

  if (product.status !== "Active") {
    throw new Error("Cannot ban bidder from non-active auction");
  }

  // 2. Check if bidder has bid on this product
  const hasBid = product.bid_histories.some((bid) => bid.user_id === bidderId);
  if (!hasBid) {
    throw new Error("This bidder has not placed any bids on this product");
  }

  // 3. Check if already banned
  const existingBan = await prisma.bannedBidder.findUnique({
    where: {
      product_id_bidder_id: {
        product_id: productId,
        bidder_id: bidderId,
      },
    },
  });

  if (existingBan) {
    throw new Error("This bidder is already banned from this product");
  }

  // 4. Create ban record
  await prisma.bannedBidder.create({
    data: {
      product_id: productId,
      bidder_id: bidderId,
    },
  });

  // 5. If banned bidder is current highest bidder, revert to next valid bidder
  if (product.current_bidder_id === bidderId) {
    // Fetch ALL banned bidders for this product
    const allBanned = await prisma.bannedBidder.findMany({
      where: { product_id: productId },
      select: { bidder_id: true },
    });

    // Create a Set of banned IDs (including the one we just banned)
    const bannedIds = new Set(allBanned.map((b) => b.bidder_id));
    bannedIds.add(bidderId);

    // Find the next highest bidder who IS NOT banned
    const validBids = product.bid_histories.filter(
      (bid) => !bannedIds.has(bid.user_id)
    );

    if (validBids.length > 0) {
      // Get the highest valid bid
      const nextHighestBid = validBids[0];

      await prisma.product.update({
        where: { id: productId },
        data: {
          current_bidder_id: nextHighestBid.user_id,
          current_price: nextHighestBid.bid_price,
        },
      });
    } else {
      // No other valid bids, revert to start price
      await prisma.product.update({
        where: { id: productId },
        data: {
          current_bidder_id: null,
          current_price: product.start_price,
        },
      });
    }
  }

  // 6. Delete any auto-bid from banned bidder
  await prisma.autoBid.deleteMany({
    where: {
      product_id: productId,
      user_id: bidderId,
    },
  });

  return {
    message: "Bidder banned successfully",
    productId,
    bannedBidderId: bidderId,
  };
};

/**
 * Check if a user is banned from a specific product
 * @param {number} productId - Product ID
 * @param {number} userId - User ID to check
 * @returns {boolean} Whether user is banned
 */
const isBidderBanned = async (productId, userId) => {
  const ban = await prisma.bannedBidder.findUnique({
    where: {
      product_id_bidder_id: {
        product_id: productId,
        bidder_id: userId,
      },
    },
  });

  return !!ban;
};

/**
 * Get all banned bidders for a product
 * @param {number} productId - Product ID
 * @returns {array} List of banned bidders
 */
const getBannedBidders = async (productId) => {
  const bannedBidders = await prisma.bannedBidder.findMany({
    where: { product_id: productId },
    include: {
      bidder: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  });

  return bannedBidders;
};

module.exports = {
  banBidderFromProduct,
  isBidderBanned,
  getBannedBidders,
};
