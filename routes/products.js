const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getProducts);
router.get("/categories/list", getCategories);
router.get("/brands/list", getBrands);
router.get("/:id", getProduct);

// Admin routes
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
