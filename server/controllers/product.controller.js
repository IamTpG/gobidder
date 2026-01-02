const productService = require("../services/product.service");
const { sendMail } = require("../utils/utils");
const prisma = require("../config/prisma");
const path = require("path");
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

    return res.status(200).json({
      data: result.data,
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

    // Attach transaction info if exists. Only show full transaction details to seller or winner.
    let transaction = null;
    try {
      const tx = await prisma.transaction.findUnique({
        where: { product_id: productId },
        include: {
          seller: { select: { id: true, full_name: true } },
          winner: { select: { id: true, full_name: true } },
          messages: true,
          ratings: true,
        },
      });

      if (tx) {
        // If request is authenticated and user is seller or winner -> include full tx
        const userId = req.user?.id;
        console.log(
          `[DEBUG] Found Tx for Product ${productId}. Tx Users: Seller=${tx.seller_id}, Winner=${tx.winner_id}. Request User: ${userId}`
        );

        if (userId && (userId === tx.seller_id || userId === tx.winner_id)) {
          console.log("[DEBUG] User authorized to view transaction details.");
          transaction = tx;
        } else {
          console.log("[DEBUG] User NOT authorized. Showing restricted view.");
          // For other users, expose only status and a generic note
          transaction = { status: tx.status, message: "Sản phẩm đã kết thúc" };
        }
      } else {
        console.log(`[DEBUG] No Tx found for Product ${productId}`);
      }
    } catch (e) {
      // ignore transaction lookup errors
      console.error("Transaction lookup error", e);
    }

    if (transaction) product.transaction = transaction;

    return res.status(200).json({
      data: product,
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
        console.log(`Sending email to seller: ${product.seller.email}`);
        console.log(`Product Link: ${productLink}`);

        await sendMail({
          to: product.seller.email,
          subject: `New Question on "${safeProductName}"`,
          text: `You have a new question: ${question_text}\n\nView and reply: ${productLink}`,
          html: htmlContent,
        });

        console.log(`Email sent successfully to ${product.seller.email}`);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Không fail request nếu email lỗi
      }
    } else {
      console.log("No seller email found, skipping email notification");
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
    const { sendMail } = require("../utils/utils");

    if (!answer_text || answer_text.trim().length === 0) {
      return res.status(400).json({ message: "Answer text is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Please login to answer" });
    }

    // Kiểm tra product và quyền của seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        seller_id: true,
        seller: {
          select: { full_name: true, email: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller_id !== userId) {
      return res
        .status(403)
        .json({ message: "Only the seller can answer questions" });
    }

    // Lấy câu hỏi hiện tại
    const question = await prisma.qnA.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        question_text: true,
        questioner_id: true,
        questioner: {
          select: { email: true, full_name: true },
        },
      },
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
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

    // ========== GỬI EMAIL THÔNG BÁO ==========
    try {
      // 1. Lấy tất cả bidder trên sản phẩm này (từ bid_histories)
      const bidders = await prisma.bidHistory.findMany({
        where: { product_id: productId },
        select: {
          user: { select: { id: true, email: true, full_name: true } },
        },
        distinct: ["user_id"],
      });

      // 2. Lấy tất cả người đặt câu hỏi trên sản phẩm này
      const questionAskers = await prisma.qnA.findMany({
        where: { product_id: productId },
        select: {
          questioner: { select: { id: true, email: true, full_name: true } },
        },
        distinct: ["questioner_id"],
      });

      // 3. Tạo Set email duy nhất (tránh gửi email trùng)
      const emailSet = new Set();

      // Thêm bidder
      bidders.forEach((bid) => {
        if (bid.user?.email) {
          emailSet.add(bid.user.email);
        }
      });

      // Thêm người đặt câu hỏi
      questionAskers.forEach((qa) => {
        if (qa.questioner?.email) {
          emailSet.add(qa.questioner.email);
        }
      });

      // 4. Lấy frontend URL từ .env
      const frontendUrl = process.env.FE_URL || "http://localhost:3000";
      const productLink = `${frontendUrl}/products/${productId}`;

      // 5. Gửi email cho tất cả người trong Set
      const emailPromises = Array.from(emailSet).map((email) => {
        const htmlContent = `
          <h2>📢 Seller Replied to a Question</h2>
          <p>Hello,</p>
          <p>A seller has replied to a question on product <strong>"${product.name}"</strong> that you're interested in.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Original Question:</h3>
            <p style="font-style: italic;">"${question.question_text}"</p>
            
            <h3>Seller's Answer:</h3>
            <p>"${answer_text.trim()}"</p>
          </div>
          
          <p><strong>Seller:</strong> ${product.seller.full_name}</p>
          
          <p>
            <a href="${productLink}" style="display: inline-block; padding: 10px 20px; background-color: #01AA85; color: white; text-decoration: none; border-radius: 5px;">
              View Product & More Questions
            </a>
          </p>
          
          <p>Best regards,<br/>GoBidder Team</p>
        `;

        return sendMail({
          to: email,
          subject: `Seller Replied to Question on "${product.name}"`,
          html: htmlContent,
        }).catch((err) => {
          console.error(`Failed to send email to ${email}:`, err.message);
        });
      });

      // Gửi tất cả email (không cần đợi)
      Promise.all(emailPromises).then(() => {
        console.log(
          `[Email] Sent notifications to ${emailSet.size} recipient(s)`
        );
      });
    } catch (emailError) {
      console.error(
        "[Email Error] Failed to send notifications:",
        emailError.message
      );
      // Không return error - API vẫn thành công, chỉ email fail
    }

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
    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("Error in getTopEndingSoon:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Top 5 sản phẩm có nhiều lượt ra giá nhất
const getTopMostBids = async (req, res) => {
  try {
    const products = await productService.getTopMostBids();
    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("Error in getTopMostBids:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Top 5 sản phẩm có giá cao nhất
const getTopHighestPrice = async (req, res) => {
  try {
    const products = await productService.getTopHighestPrice();
    return res.status(200).json({ data: products });
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
    return res.status(200).json({ data: products });
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//multer cho upload lên cloudinary

const multer = require("multer");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
    allowUnratedBidders,
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
    return res
      .status(400)
      .json({ message: "At least 3 images are required for the product." });
  }

  if (!startPrice || !stepPrice) {
    if (files) deleteLocalFiles(files);
    return res
      .status(400)
      .json({ message: "Start price and step price are required" });
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

    // ExpiredSeller cannot create new products
    if (req.user.role === "ExpiredSeller") {
      if (files) deleteLocalFiles(files);
      return res.status(403).json({
        message:
          "Your 7 days being a seller has expired. Please wait until all your products are completed before requesting seller status again.",
      });
    }

    // 1. Tải Từng Tệp Lên Cloudinary
    for (const file of files) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "auction_products",
      });
      imageUrls.push(uploadResult.secure_url);
    }

    // 2. Dọn dẹp File Tạm thời
    deleteLocalFiles(files);

    // Xử lý buyNowPrice để tránh lỗi BigInt với chuỗi rỗng hoặc "null"
    let safeBuyNowPrice = null;
    if (buyNowPrice && buyNowPrice !== "null" && buyNowPrice.trim() !== "") {
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
      allowUnratedBidders: allowUnratedBidders === "true", // Chuyển chuỗi sang boolean
    };

    const newProduct = await productService.createProduct(
      sellerId,
      productData
    );

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
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

// Cập nhật sản phẩm (Seller edit)
const update = async (req, res) => {
  const productId = parseInt(req.params.id);
  const sellerId = req.user.id;

  const {
    name,
    description,
    startPrice,
    stepPrice,
    buyNowPrice,
    categoryId,
    endTime,
    autoRenew,
    allowUnratedBidders,
    oldImages, // Array of URLs to keep
  } = req.body;

  // Handle new images from upload
  const files = req.files;
  let newImageUrls = [];

  try {
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload(file.path, (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          });
        });
      });

      newImageUrls = await Promise.all(uploadPromises);
      // Clean up local files
      deleteLocalFiles(files);
    }

    // Combine old images (ensure it's an array) and new images
    let finalImages = [];
    if (oldImages) {
      finalImages = Array.isArray(oldImages) ? oldImages : [oldImages];
    }
    finalImages = [...finalImages, ...newImageUrls];

    // Validation cơ bản
    if (!name || !categoryId || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate Images (Bắt buộc >= 3 ảnh)
    if (finalImages.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 images are required" });
    }

    // Validate Prices
    if (!startPrice || !stepPrice) {
      return res
        .status(400)
        .json({ message: "Start price and step price are required" });
    }

    if (Number(startPrice) <= 0 || Number(stepPrice) <= 0) {
      return res.status(400).json({ message: "Prices must be positive" });
    }

    // Validate EndTime
    if (new Date(endTime) <= new Date()) {
      return res
        .status(400)
        .json({ message: "End time must be in the future" });
    }

    const updatedProduct = await productService.updateProduct(
      productId,
      sellerId,
      {
        name,
        description, // This is the NEW description to append
        images: finalImages,
        startPrice: Number(startPrice),
        stepPrice: Number(stepPrice),
        buyNowPrice: buyNowPrice ? Number(buyNowPrice) : null,
        categoryId: Number(categoryId),
        endTime: new Date(endTime),
        autoRenew: autoRenew === "true" || autoRenew === true,
        allowUnratedBidders:
          allowUnratedBidders === "true" || allowUnratedBidders === true,
      }
    );

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in update product:", error);
    if (files) deleteLocalFiles(files);
    return res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách sản phẩm của seller
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await productService.getSellerProducts(sellerId);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error in getSellerProducts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Append description entry (Seller only)
const appendDescription = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const sellerId = req.user.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Description text is required" });
    }

    const updated = await productService.appendDescription(
      productId,
      sellerId,
      text.trim()
    );
    return res.status(200).json({ success: true, product: updated });
  } catch (error) {
    console.error("Error in appendDescription:", error);
    return res
      .status(400)
      .json({ message: error.message || "Failed to append description" });
  }
};

// Lấy tất cả sản phẩm (Admin only - bao gồm tất cả status)
const getAllProductsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryIdParam = req.query.categoryId ?? req.query.category;
    const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
    const sort = req.query.sort || "created_at";
    const q = req.query.q || "";
    const status = req.query.status;

    const maxLimit = 50;
    const validateLimit = Math.min(limit, maxLimit);
    const validatePage = Math.max(page, 1);
    const skip = (validatePage - 1) * validateLimit;

    const result = await productService.getAllProductsAdmin({
      page: validatePage,
      limit: validateLimit,
      categoryId,
      sort,
      q,
      skip,
      status,
    });

    return res.status(200).json({
      data: result.data,
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
    console.error("Error in getAllProductsAdmin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy một sản phẩm chi tiết (Admin only)
const getProductByIdAdmin = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Admin có thể xem transaction details
    let transaction = null;
    try {
      const tx = await prisma.transaction.findUnique({
        where: { product_id: productId },
        include: {
          seller: { select: { id: true, full_name: true } },
          winner: { select: { id: true, full_name: true } },
          messages: true,
          ratings: true,
        },
      });
      if (tx) transaction = tx;
    } catch (e) {
      console.error("Transaction lookup error", e);
    }

    if (transaction) product.transaction = transaction;

    return res.status(200).json({
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductByIdAdmin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật sản phẩm (Admin only - có thể sửa bất kỳ sản phẩm nào)
const updateProductAdmin = async (req, res) => {
  const productId = parseInt(req.params.id);

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
    status, // Admin có thể thay đổi status
  } = req.body;

  // Validation cơ bản
  if (!name || !description || !categoryId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate Images (Bắt buộc >= 3 ảnh)
  if (!images || !Array.isArray(images) || images.length < 3) {
    return res
      .status(400)
      .json({ message: "At least 3 images are required for the product." });
  }

  // Validate Prices
  if (!startPrice || !stepPrice) {
    return res
      .status(400)
      .json({ message: "Start price and step price are required" });
  }

  if (Number(startPrice) <= 0 || Number(stepPrice) <= 0) {
    return res.status(400).json({ message: "Prices must be positive numbers" });
  }

  // Validate EndTime (nếu có)
  if (endTime && new Date(endTime) <= new Date()) {
    return res.status(400).json({ message: "End time must be in the future" });
  }

  // Validate status nếu có
  const validStatuses = ["Pending", "Active", "Sold", "Expired", "Removed"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const updatedProduct = await productService.updateProductAdmin(productId, {
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
    });

    return res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error in updateProductAdmin:", error);
    return res
      .status(400)
      .json({ message: error.message || "Failed to update product" });
  }
};

// Xóa sản phẩm (Admin only - set status = Removed)
const deleteProductAdmin = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deletedProduct = await productService.deleteProductAdmin(productId);

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error in deleteProductAdmin:", error);
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
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
  update,
  getSellerProducts,
  appendDescription,
  getAllProductsAdmin,
  getProductByIdAdmin,
  updateProductAdmin,
  deleteProductAdmin,
};
