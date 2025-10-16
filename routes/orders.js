const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

// Protected routes
router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/admin/all", protect, authorize("admin"), getAllOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/cancel", protect, cancelOrder);

// Admin routes
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

module.exports = router;
