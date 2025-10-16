const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

// @desc    Create payment intent
// @route   POST /api/stripe/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Calculate total amount (in cents)
    const amount = Math.round(
      (order.total_price + order.taxAmount + order.shippingCost) * 100
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
      description: `Order #${order._id}`,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Confirm payment
// @route   POST /api/stripe/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    // Get order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update order with payment info
      order.paymentInfo.transactionId = paymentIntentId;
      order.paymentInfo.paidAt = Date.now();
      order.status = "Processing";
      await order.save();

      res.status(200).json({
        success: true,
        message: "Payment confirmed",
        order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Webhook for Stripe events
// @route   POST /api/stripe/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      // Update order status
      const order = await Order.findById(paymentIntent.metadata.orderId);
      if (order) {
        order.paymentInfo.transactionId = paymentIntent.id;
        order.paymentInfo.paidAt = Date.now();
        order.status = "Processing";
        await order.save();
      }
      break;

    case "payment_intent.payment_failed":
      // Handle failed payment
      console.log("Payment failed:", event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Get Stripe publishable key
// @route   GET /api/stripe/config
// @access  Public
exports.getStripeConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};
