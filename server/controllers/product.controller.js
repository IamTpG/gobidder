const productService = require("../services/product.service");
const { serializeBigInt, sendMail } = require("../utils/utils");
const prisma = require("../config/prisma");

// Lấy tất cả sản phẩm
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryIdParam = req.query.categoryId ?? req.query.category;
    const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
    const sort = req.query.sort || "created_at";
    const q = req.query.q || "";

    const maxLimit = 50;
    const validateLimit = Math.min(limit, maxLimit);
    const validatePage = Math.max(page, 1);
    const skip = (validatePage - 1) * validateLimit;

    const result = await productService.getProducts({
      page: validatePage,
      limit: validateLimit,
      categoryId,
      sort,
      q,
      skip,
    });

    const serializedData = serializeBigInt(result.data);

    return res.status(200).json({
      data: serializedData,
      pagination: {
        page: validatePage,
        limit: validateLimit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy một sản phẩm
const getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const serializedProduct = serializeBigInt(product);

    return res.status(200).json({
      data: serializedProduct,
    });
  } catch (error) {
    console.error("Error in getProductById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Tạo câu hỏi mới (Buyer hỏi về sản phẩm)
const createQuestion = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { question_text } = req.body;
    const userId = req.user?.id; // Lấy từ auth middleware

    if (!question_text || question_text.trim().length === 0) {
      return res.status(400).json({ message: "Question text is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Please login to ask question" });
    }

    // Kiểm tra xem product có tồn tại và lấy thông tin seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Kiểm tra người hỏi không phải là seller của sản phẩm
    if (product.seller_id === userId) {
      return res.status(403).json({
        message: "Seller cannot ask questions on their own product",
      });
    }

    // Tạo câu hỏi trong database
    const newQuestion = await prisma.qnA.create({
      data: {
        product_id: productId,
        questioner_id: userId,
        question_text: question_text.trim(),
        question_time: new Date(),
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
    });

    // Gửi email thông báo cho seller
    if (product.seller && product.seller.email) {
      const frontendUrl = process.env.FE_URL || "http://localhost:3000";
      const productLink = `${frontendUrl}/products/${productId}?openQ=${newQuestion.id}`;

      // Escape HTML để tránh lỗi với ký tự đặc biệt
      const escapeHtml = (text) => {
        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };

      const safeQuestionText = escapeHtml(question_text.trim());
      const safeProductName = escapeHtml(product.name);
      const safeSellerName = escapeHtml(product.seller.full_name);
      const safeQuestioerName = escapeHtml(newQuestion.questioner.full_name);

      // HTML email template
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669; margin-bottom: 20px;">New Question on Your Product</h2>
          <p style="font-size: 14px; color: #374151;">Hello <strong>${safeSellerName}</strong>,</p>
          <p style="font-size: 14px; color: #374151;">You have received a new question about your product: <strong>${safeProductName}</strong></p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 14px;">Question:</p>
            <p style="margin: 10px 0; color: #374151; font-size: 14px;">${safeQuestionText}</p>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              Asked by: ${safeQuestioerName}
            </p>
          </div>

          <p style="font-size: 14px; color: #374151; margin-bottom: 20px;">Click the button below to view the product and answer the question:</p>
          
          <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
            <tr>
              <td style="background-color: #059669; border-radius: 6px;">
                <a href="${productLink}" 
                   style="display: inline-block; color: #ffffff; padding: 12px 24px; 
                          text-decoration: none; font-weight: bold; font-size: 14px;">
                  View Product &amp; Reply
                </a>
              </td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #374151; margin-top: 20px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 13px; color: #059669; word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
            <a href="${productLink}" style="color: #059669; text-decoration: underline;">${productLink}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            This is an automated notification from GoBidder. Please do not reply to this email.
          </p>
        </div>
      `;

      try {
        console.log(`🔔 Sending email to seller: ${product.seller.email}`);
        console.log(`📧 Product Link: ${productLink}`);

        await sendMail({
          to: product.seller.email,
          subject: `New Question on "${safeProductName}"`,
          text: `You have a new question: ${question_text}\n\nView and reply: ${productLink}`,
          html: htmlContent,
        });

        console.log(`✅ Email sent successfully to ${product.seller.email}`);
      } catch (emailError) {
        console.error("❌ Failed to send email notification:", emailError);
        // Không fail request nếu email lỗi
      }
    } else {
      console.log("⚠️ No seller email found, skipping email notification");
    }

    // Transform response
    const response = {
      id: newQuestion.id,
      questionText: newQuestion.question_text,
      questionTime: newQuestion.question_time,
      questionerId: newQuestion.questioner_id,
      questioner: {
        id: newQuestion.questioner.id,
        fullName: newQuestion.questioner.full_name,
        ratingPlus: newQuestion.questioner.rating_plus,
        ratingMinus: newQuestion.questioner.rating_minus,
      },
      answerText: null,
      answerTime: null,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createQuestion:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Trả lời câu hỏi (Seller trả lời)
const answerQuestion = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const questionId = parseInt(req.params.questionId);
    const { answer_text } = req.body;
    const userId = req.user?.id;

    if (!answer_text || answer_text.trim().length === 0) {
      return res.status(400).json({ message: "Answer text is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Please login to answer" });
    }

    // Kiểm tra product và quyền của seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { seller_id: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller_id !== userId) {
      return res
        .status(403)
        .json({ message: "Only the seller can answer questions" });
    }

    // Cập nhật câu trả lời
    const updatedQuestion = await prisma.qnA.update({
      where: { id: questionId },
      data: {
        answer_text: answer_text.trim(),
        answer_time: new Date(),
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
    });

    // Transform response
    const response = {
      id: updatedQuestion.id,
      questionText: updatedQuestion.question_text,
      questionTime: updatedQuestion.question_time,
      questionerId: updatedQuestion.questioner_id,
      questioner: {
        id: updatedQuestion.questioner.id,
        fullName: updatedQuestion.questioner.full_name,
        ratingPlus: updatedQuestion.questioner.rating_plus,
        ratingMinus: updatedQuestion.questioner.rating_minus,
      },
      answerText: updatedQuestion.answer_text,
      answerTime: updatedQuestion.answer_time,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in answerQuestion:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Top 5 sản phẩm gần kết thúc
const getTopEndingSoon = async (req, res) => {
  try {
    const products = await productService.getTopEndingSoon();
    const serializedProducts = serializeBigInt(products);
    return res.status(200).json({ data: serializedProducts });
  } catch (error) {
    console.error("Error in getTopEndingSoon:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Top 5 sản phẩm có nhiều lượt ra giá nhất
const getTopMostBids = async (req, res) => {
  try {
    const products = await productService.getTopMostBids();
    const serializedProducts = serializeBigInt(products);
    return res.status(200).json({ data: serializedProducts });
  } catch (error) {
    console.error("Error in getTopMostBids:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Top 5 sản phẩm có giá cao nhất
const getTopHighestPrice = async (req, res) => {
  try {
    const products = await productService.getTopHighestPrice();
    const serializedProducts = serializeBigInt(products);
    return res.status(200).json({ data: serializedProducts });
  } catch (error) {
    console.error("Error in getTopHighestPrice:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Sản phẩm liên quan (cùng parent_id của category)
const getRelatedProducts = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 5;

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const products = await productService.getRelatedProducts(productId, limit);
    const serializedProducts = serializeBigInt(products);
    return res.status(200).json({ data: serializedProducts });
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//multer cho upload lên cloudinary

const multer = require("multer");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Xóa file sau khi đã tải lên Cloudinary
const deleteLocalFiles = (files) => {
  files.forEach((file) => {
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      console.error("Error deleting temp file:", e);
    }
  });
};
const create = async (req, res) => {
  const {
    name,
    description,
    startPrice,
    stepPrice,
    buyNowPrice,
    categoryId,
    endTime,
    autoRenew,
  } = req.body;

  // Lấy mảng tệp đã được Multer xử lý
  const files = req.files;
  let imageUrls = [];

  // --- VALIDATION (Giữ nguyên) ---
  if (!name || !description || !categoryId || !endTime) {
    if (files) deleteLocalFiles(files);
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!files || !Array.isArray(files) || files.length < 3) {
    if (files) deleteLocalFiles(files);
    return res.status(400).json({ message: "At least 3 images are required for the product." });
  }

  if (!startPrice || !stepPrice) {
    if (files) deleteLocalFiles(files);
    return res.status(400).json({ message: "Start price and step price are required" });
  }

  if (Number(startPrice) <= 0 || Number(stepPrice) <= 0) {
    if (files) deleteLocalFiles(files);
    return res.status(400).json({ message: "Prices must be positive numbers" });
  }

  if (new Date(endTime) <= new Date()) {
    if (files) deleteLocalFiles(files);
    return res.status(400).json({ message: "End time must be in the future" });
  }

  try {
    const sellerId = req.user.id;

    // 1. Tải Từng Tệp Lên Cloudinary
    for (const file of files) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "auction_products",
      });
      imageUrls.push(uploadResult.secure_url);
    }

    // 2. Dọn dẹp File Tạm thời
    deleteLocalFiles(files);

    // ⭐ SỬA Ở ĐÂY: Di chuyển logic tạo data vào sau khi đã có imageUrls ⭐
    
    // Xử lý buyNowPrice để tránh lỗi BigInt với chuỗi rỗng hoặc "null"
    let safeBuyNowPrice = null;
    if (buyNowPrice && buyNowPrice !== 'null' && buyNowPrice.trim() !== '') {
        safeBuyNowPrice = buyNowPrice;
    }

    const productData = {
      name,
      description,
      images: imageUrls, // Lúc này mảng đã có link ảnh
      startPrice,
      stepPrice,
      buyNowPrice: safeBuyNowPrice, // Dùng biến đã làm sạch
      categoryId: Number(categoryId), // Đảm bảo là số
      endTime,
      autoRenew: autoRenew === "true", // Chuyển chuỗi sang boolean
    };

    const newProduct = await productService.createProduct(
      sellerId,
      productData
    );

    const safeProduct = serializeBigInt(newProduct);

    return res.status(201).json({
      message: "Product created successfully",
      product: safeProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    if (files) deleteLocalFiles(files);
    if (error.message.includes("Buy-now price")) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createQuestion,
  answerQuestion,
  getTopEndingSoon,
  getTopMostBids,
  getTopHighestPrice,
  getRelatedProducts,
  create,
  upload,
};
