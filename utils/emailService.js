const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log("Email service not configured");
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to ShopEase! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to ShopEase!</h1>
          <p>Hi ${user.username},</p>
          <p>Thank you for joining ShopEase! We're excited to have you as part of our community.</p>
          <p>Start exploring our wide range of products and enjoy shopping with us.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <ul>
              <li>Browse our featured products</li>
              <li>Add items to your wishlist</li>
              <li>Get exclusive deals and offers</li>
            </ul>
          </div>
          <p>Happy Shopping!</p>
          <p style="color: #6B7280;">The ShopEase Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
  }
};

// Send order confirmation email
exports.sendOrderConfirmation = async (order, user) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log("Email service not configured");
      return;
    }

    const transporter = createTransporter();

    // Calculate total
    const subtotal = order.total_price;
    const tax = order.taxAmount;
    const shipping = order.shippingCost;
    const total = subtotal + tax + shipping;

    // Generate product list HTML
    const productList = order.products
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">${
          item.product.name
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right;">$${item.price.toFixed(
          2
        )}</td>
      </tr>
    `
      )
      .join("");

    const mailOptions = {
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Order Confirmed! 🎉</h1>
          <p>Hi ${user.username},</p>
          <p>Thank you for your order! We've received your order and will process it soon.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> #${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <h3>Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #F3F4F6;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${productList}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right;">
            <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> $${tax.toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${shipping.toFixed(2)}</p>
            <h3 style="color: #4F46E5;">Total: $${total.toFixed(2)}</h3>
          </div>

          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
        order.shippingAddress.zipCode
      }<br>
            ${order.shippingAddress.country}</p>
          </div>

          <p>We'll send you another email when your order ships.</p>
          <p style="color: #6B7280;">Thanks for shopping with us!</p>
          <p style="color: #6B7280;">The ShopEase Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending order confirmation:", error.message);
  }
};

// Send order status update email
exports.sendOrderStatusUpdate = async (order, user, newStatus) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log("Email service not configured");
      return;
    }

    const transporter = createTransporter();

    let statusMessage = "";
    let statusColor = "#4F46E5";

    switch (newStatus) {
      case "Processing":
        statusMessage = "Your order is being processed and will ship soon.";
        break;
      case "Shipped":
        statusMessage =
          "Great news! Your order has been shipped and is on its way.";
        statusColor = "#10B981";
        break;
      case "Delivered":
        statusMessage = "Your order has been delivered! Enjoy your purchase.";
        statusColor = "#10B981";
        break;
      case "Cancelled":
        statusMessage =
          "Your order has been cancelled. If you have any questions, please contact us.";
        statusColor = "#EF4444";
        break;
      default:
        statusMessage = `Your order status has been updated to: ${newStatus}`;
    }

    const mailOptions = {
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Update - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${statusColor};">Order Status Update</h1>
          <p>Hi ${user.username},</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order #${order._id}</h3>
            <p style="font-size: 18px;"><strong>Status:</strong> <span style="color: ${statusColor};">${newStatus}</span></p>
            <p>${statusMessage}</p>
          </div>

          ${
            newStatus === "Shipped"
              ? `
            <p>Track your order to see estimated delivery date.</p>
          `
              : ""
          }

          ${
            newStatus === "Delivered"
              ? `
            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Love your purchase?</strong> We'd appreciate your review!</p>
            </div>
          `
              : ""
          }

          <p style="color: #6B7280;">Thank you for shopping with ShopEase!</p>
          <p style="color: #6B7280;">The ShopEase Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending status update email:", error.message);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log("Email service not configured");
      return;
    }

    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Password Reset Request</h1>
          <p>Hi ${user.username},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${resetUrl}</p>

          <p style="color: #EF4444; margin-top: 20px;"><strong>This link will expire in 1 hour.</strong></p>

          <p>If you didn't request this, please ignore this email.</p>
          
          <p style="color: #6B7280;">The ShopEase Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
  }
};

// Send low stock alert to admin
exports.sendLowStockAlert = async (product) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
      console.log("Email service not configured");
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `⚠️ Low Stock Alert - ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #EF4444;">⚠️ Low Stock Alert</h1>
          
          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3>${product.name}</h3>
            <p><strong>Current Stock:</strong> ${product.stock_quantity} units</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> $${product.price}</p>
          </div>

          <p>This product is running low on stock. Please restock soon to avoid running out.</p>
          
          <p style="color: #6B7280;">ShopEase Inventory Management</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Low stock alert sent for ${product.name}`);
  } catch (error) {
    console.error("Error sending low stock alert:", error.message);
  }
};
