const express = require("express");

const productController = require("../controllers/product.controller");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", productController.getProducts);

// Lấy một sản phẩm
router.get("/:id", productController.getProductById);

module.exports = router;
