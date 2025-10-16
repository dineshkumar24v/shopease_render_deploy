const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getStripeConfig,
} = require("../controllers/stripeController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/config", getStripeConfig);

// Webhook route (must be raw body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Protected routes
router.post("/create-payment-intent", protect, createPaymentIntent);
router.post("/confirm-payment", protect, confirmPayment);

module.exports = router;
