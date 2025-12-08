const prisma = require("../config/prisma");

// Create transaction for a product when auction ends (if winner exists)
const createTransactionForProduct = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true, current_bidder: true },
  });

  if (!product) throw new Error("Product not found");

  // If product has no winner or no current_bidder, cannot create
  if (!product.current_bidder_id) throw new Error("Product has no winner");

  // If transaction exists, return it
  const existing = await prisma.transaction.findUnique({
    where: { product_id: productId },
  });
  if (existing) return existing;

  const tx = await prisma.transaction.create({
    data: {
      product_id: productId,
      winner_id: product.current_bidder_id,
      seller_id: product.seller_id,
      final_price: product.current_price,
      status: "PendingPayment",
      created_at: new Date(),
    },
  });

  return tx;
};

const getTransactionByProduct = async (productId) => {
  const id = parseInt(productId);
  if (isNaN(id)) throw new Error("Invalid product ID");

  const transaction = await prisma.transaction.findUnique({
    where: { product_id: id },
    include: {
      seller: {
        select: {
          id: true,
          full_name: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
      winner: {
        select: {
          id: true,
          full_name: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
      messages: { orderBy: { created_at: "asc" } },
      ratings: true,
      product: { select: { id: true, name: true, images: true } },
    },
  });

  if (!transaction) throw new Error("Transaction not found");
  return transaction;
};

const getTransactionById = async (id) => {
  const txId = parseInt(id);
  if (isNaN(txId)) throw new Error("Invalid transaction ID");

  const transaction = await prisma.transaction.findUnique({
    where: { id: txId },
    include: {
      seller: {
        select: {
          id: true,
          full_name: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
      winner: {
        select: {
          id: true,
          full_name: true,
          rating_plus: true,
          rating_minus: true,
        },
      },
      messages: { orderBy: { created_at: "asc" } },
      ratings: true,
      product: { select: { id: true, name: true, images: true } },
    },
  });

  if (!transaction) throw new Error("Transaction not found");
  return transaction;
};

// buyer uploads payment proof + shipping address
const buyerUploadPayment = async (
  transactionId,
  buyerId,
  { shippingAddress, paymentInvoiceUrl }
) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");
  if (tx.winner_id !== buyerId)
    throw new Error("You are not the buyer for this transaction");
  if (tx.status !== "PendingPayment")
    throw new Error("Transaction not in PendingPayment");

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      shipping_address: shippingAddress,
      payment_invoice_url: paymentInvoiceUrl || null,
      status: "PendingShipping",
    },
  });

  return updated;
};

// seller confirms payment and uploads shipping invoice
const sellerConfirmShipping = async (
  transactionId,
  sellerId,
  { shippingInvoiceUrl }
) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");
  if (tx.seller_id !== sellerId)
    throw new Error("You are not the seller for this transaction");
  if (tx.status !== "PendingShipping")
    throw new Error("Transaction not in PendingShipping");

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      shipping_invoice_url: shippingInvoiceUrl || null,
      seller_confirmed_at: new Date(),
      status: "PendingReceipt",
    },
  });

  return updated;
};

// buyer confirms receipt
const buyerConfirmReceipt = async (transactionId, buyerId) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");
  if (tx.winner_id !== buyerId)
    throw new Error("You are not the buyer for this transaction");
  if (tx.status !== "PendingReceipt")
    throw new Error("Transaction not in PendingReceipt");

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      buyer_confirmed_at: new Date(),
      status: "Completed",
    },
  });

  return updated;
};

// seller cancels transaction — add rating negative for winner
const sellerCancel = async (transactionId, sellerId, { reason }) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");
  if (tx.seller_id !== sellerId)
    throw new Error("You are not the seller for this transaction");
  if (tx.status === "Cancelled")
    throw new Error("Transaction already cancelled");

  // Perform cancellation and create a negative rating for winner
  return await prisma.$transaction(async (pr) => {
    // 1) Update transaction
    const updatedTx = await pr.transaction.update({
      where: { id: transactionId },
      data: { status: "Cancelled", cancel_reason: reason || null },
    });

    // 2) Create negative rating for winner (by seller)
    try {
      await pr.rating.create({
        data: {
          transaction_id: transactionId,
          rater_id: sellerId,
          rated_user_id: tx.winner_id,
          score: "Negative",
          comment: reason || "Người thắng không thanh toán",
        },
      });

      // 3) Increment rating_minus for the winner
      await pr.user.update({
        where: { id: tx.winner_id },
        data: { rating_minus: { increment: 1 } },
      });
    } catch (e) {
      // ignore rating creation errors but keep transaction cancelled
      console.error("Failed to create negative rating on cancel:", e);
    }

    return updatedTx;
  });
};

// Messages
const addMessage = async (transactionId, senderId, receiverId, message) => {
  if (!message || !message.trim()) throw new Error("Message is required");

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");

  // Only seller and winner allowed
  if (![tx.seller_id, tx.winner_id].includes(senderId))
    throw new Error("Not allowed");

  const msg = await prisma.chatMessage.create({
    data: {
      transaction_id: transactionId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: message.trim(),
    },
  });

  return msg;
};

const getMessages = async (transactionId) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");

  const messages = await prisma.chatMessage.findMany({
    where: { transaction_id: transactionId },
    orderBy: { created_at: "asc" },
  });

  return messages;
};

// Rating create/update; ensures user's rating_plus/minus counters are in sync
const upsertRating = async (transactionId, raterId, { score, comment }) => {
  if (!["Positive", "Negative"].includes(score))
    throw new Error("Invalid score");

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");

  // rater must be seller or winner
  if (![tx.seller_id, tx.winner_id].includes(raterId))
    throw new Error("Not allowed to rate on this transaction");

  const ratedUserId = raterId === tx.seller_id ? tx.winner_id : tx.seller_id;

  return await prisma.$transaction(async (pr) => {
    // Check existing
    const existing = await pr.rating.findUnique({
      where: {
        transaction_id_rater_id: {
          transaction_id: transactionId,
          rater_id: raterId,
        },
      },
    });

    if (existing) {
      // Update existing rating
      const updated = await pr.rating.update({
        where: { id: existing.id },
        data: {
          score,
          comment: comment || null,
        },
      });

      // If score changed, adjust counters
      if (existing.score !== score) {
        if (existing.score === "Positive") {
          // Was Positive, now Negative
          await pr.user.update({
            where: { id: ratedUserId },
            data: {
              rating_plus: { decrement: 1 },
              rating_minus: { increment: 1 },
            },
          });
        } else {
          // Was Negative, now Positive
          await pr.user.update({
            where: { id: ratedUserId },
            data: {
              rating_minus: { decrement: 1 },
              rating_plus: { increment: 1 },
            },
          });
        }
      }

      return updated;
    } else {
      // Create new rating
      const created = await pr.rating.create({
        data: {
          transaction_id: transactionId,
          rater_id: raterId,
          rated_user_id: ratedUserId,
          score,
          comment: comment || null,
        },
      });

      // increment user counters
      if (score === "Positive") {
        await pr.user.update({
          where: { id: ratedUserId },
          data: { rating_plus: { increment: 1 } },
        });
      } else {
        await pr.user.update({
          where: { id: ratedUserId },
          data: { rating_minus: { increment: 1 } },
        });
      }

      return created;
    }
  });
};

module.exports = {
  createTransactionForProduct,
  getTransactionByProduct,
  getTransactionById,
  buyerUploadPayment,
  sellerConfirmShipping,
  buyerConfirmReceipt,
  sellerCancel,
  addMessage,
  getMessages,
  upsertRating,
};
