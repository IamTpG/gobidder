const transactionService = require("../services/transaction.service");
const prisma = require("../config/prisma");

// Multer + cloudinary for uploading proof images
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const deleteLocalFiles = (files) => {
  files?.forEach((file) => {
    try { fs.unlinkSync(file.path); } catch {};
  });
};

const createForProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return res.status(400).json({ message: "Invalid product ID" });

    const tx = await transactionService.createTransactionForProduct(productId);
    return res.status(201).json({ data: tx });
  } catch (error) {
    console.error("createForProduct error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
};

const getByProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const tx = await transactionService.getTransactionByProduct(productId);
    return res.status(200).json({ data: tx });
  } catch (error) {
    console.error("getByProduct error:", error);
    return res.status(404).json({ message: error.message || "Not found" });
  }
};

const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tx = await transactionService.getTransactionById(id);
    return res.status(200).json({ data: tx });
  } catch (error) {
    console.error("getById error:", error);
    return res.status(404).json({ message: error.message || "Not found" });
  }
};

// Buyer uploads payment proof and shipping address
const postPayment = [upload.single("invoice"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const buyerId = req.user.id;
    let paymentInvoiceUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'transactions/payment' });
      paymentInvoiceUrl = uploadResult.secure_url;
      deleteLocalFiles([req.file]);
    }

    const { shipping_address } = req.body;
    const updated = await transactionService.buyerUploadPayment(id, buyerId, { shippingAddress: shipping_address, paymentInvoiceUrl });
    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error("postPayment error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
}];

// Seller confirms shipping (uploads shipping invoice)
const postShipping = [upload.single("invoice"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sellerId = req.user.id;
    let shippingInvoiceUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'transactions/shipping' });
      shippingInvoiceUrl = uploadResult.secure_url;
      deleteLocalFiles([req.file]);
    }

    const updated = await transactionService.sellerConfirmShipping(id, sellerId, { shippingInvoiceUrl });
    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error("postShipping error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
}];

const postConfirmReceipt = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const buyerId = req.user.id;
    const updated = await transactionService.buyerConfirmReceipt(id, buyerId);
    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error("postConfirmReceipt error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
};

const postCancel = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sellerId = req.user.id;
    const { reason } = req.body;
    const updated = await transactionService.sellerCancel(id, sellerId, { reason });
    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error("postCancel error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
};

// Chat
const postMessage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const senderId = req.user.id;
    const { receiverId, message } = req.body;
    const msg = await transactionService.addMessage(id, senderId, receiverId, message);
    return res.status(201).json({ data: msg });
  } catch (error) {
    console.error("postMessage error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
};

const getMessages = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const messages = await transactionService.getMessages(id);
    return res.status(200).json({ data: messages });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
};

// Ratings
const postRating = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const raterId = req.user.id;
    const { score, comment } = req.body;
    const saved = await transactionService.upsertRating(id, raterId, { score, comment });
    return res.status(201).json({ data: saved });
  } catch (error) {
    console.error("postRating error:", error);
    return res.status(400).json({ message: error.message || "Failed" });
  }
};

module.exports = {
  createForProduct,
  getByProduct,
  getById,
  postPayment,
  postShipping,
  postConfirmReceipt,
  postCancel,
  postMessage,
  getMessages,
  postRating,
  upload,
};
