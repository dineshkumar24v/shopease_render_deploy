const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
console.log(
  "ENV check:",
  process.env.CLOUDINARY_NAME,
  process.env.CLOUDINARY_KEY ? "✅ key loaded" : "❌ key missing"
);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Product = require("../models/Product");

// Debug check
console.log(
  "ENV check:",
  process.env.CLOUDINARY_NAME,
  process.env.CLOUDINARY_KEY ? "✅ key loaded" : "❌ key missing"
);

// 🧩 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// 👤 Sample Users
const users = [
  {
    username: "admin",
    email: "admin@shopease.com",
    password: "admin1234",
    role: "admin",
  },
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password1234",
    role: "user",
  },
];

// 🛍️ Sample Products
const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    price: 199.99,
    category: "Electronics",
    stock_quantity: 50,
    brand: "AudioTech",
    images: ["public/images/product10.jpg"],
    featured: true,
  },
  {
    name: "Smart Fitness Watch",
    description:
      "Track your fitness goals with heart rate monitoring, GPS, and sleep tracking.",
    price: 299.99,
    category: "Electronics",
    stock_quantity: 30,
    brand: "FitGear",
    images: ["public/images/product5.jpg"],
    featured: true,
  },
  {
    name: "Organic Cotton T-Shirt",
    description:
      "Comfortable and sustainable organic cotton t-shirt in multiple colors.",
    price: 29.99,
    category: "Clothing",
    stock_quantity: 100,
    brand: "EcoWear",
    images: ["public/images/product6.jpg"],
  },
  {
    name: "Yoga Mat Premium",
    description:
      "Non-slip yoga mat with extra cushioning for comfort during your practice.",
    price: 49.99,
    category: "Sports",
    stock_quantity: 75,
    brand: "YogaPro",
    images: ["public/images/product7.webp"],
  },
  {
    name: "LED Desk Lamp",
    description:
      "Adjustable LED desk lamp with multiple brightness levels and USB charging port.",
    price: 39.99,
    category: "Home & Garden",
    stock_quantity: 60,
    brand: "BrightHome",
    images: ["public/images/product8.jpg"],
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 24.99,
    category: "Sports",
    stock_quantity: 120,
    brand: "HydroFlask",
    images: ["public/images/product9.webp"],
    featured: true,
  },
  {
    name: "Programming Book Bundle",
    description:
      "Complete guide to modern web development with JavaScript, React, and Node.js.",
    price: 79.99,
    category: "Books",
    stock_quantity: 40,
    brand: "TechPress",
    images: ["public/images/product1.jpg"],
  },
  {
    name: "Wireless Gaming Mouse",
    description:
      "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
    price: 69.99,
    category: "Electronics",
    stock_quantity: 45,
    brand: "GamePro",
    images: ["public/images/product2.jpg"],
  },
  {
    name: "Aromatherapy Diffuser",
    description:
      "Ultrasonic essential oil diffuser with LED mood lighting and auto shut-off.",
    price: 34.99,
    category: "Home & Garden",
    stock_quantity: 80,
    brand: "ZenHome",
    images: ["public/images/product3.jpg"],
  },
  {
    name: "Resistance Bands Set",
    description:
      "Complete set of resistance bands for strength training and physical therapy.",
    price: 19.99,
    category: "Sports",
    stock_quantity: 90,
    brand: "FitnessPro",
    images: ["public/images/product4.webp"],
  },
];

// 🗄️ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// 🌱 Seed Function
const seedDatabase = async () => {
  try {
    console.log("🔗 Connecting and preparing to seed...");

    // 🧹 Clear products (keep existing users)
    await Product.deleteMany();
    console.log("🗑️  Cleared existing products");

    // 🔼 Upload product images to Cloudinary
    const uploadedProducts = [];

    for (const product of products) {
      const uploadedImages = [];

      for (const img of product.images) {
        try {
          // ✅ Absolute path to image in backend/public/images
          const filePath = path.join(__dirname, "..", img);
          console.log("📸 Uploading:", filePath);

          const result = await cloudinary.uploader.upload(filePath, {
            folder: "ShopEase/products",
          });

          uploadedImages.push(result.secure_url);
          console.log("✅ Uploaded:", result.secure_url);
        } catch (err) {
          console.error(`❌ Cloudinary upload failed for ${img}:`, err.message);
        }
      }

      uploadedProducts.push({ ...product, images: uploadedImages });
    }

    // 💾 Insert Products
    const createdProducts = await Product.insertMany(uploadedProducts);
    console.log(`✅ ${createdProducts.length} products seeded successfully`);
    console.log("🎉 Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
};

// ▶ Run Seeder
seedDatabase();

// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// require("dotenv").config();

// const User = require("../models/User");
// const Product = require("../models/Product");

// // Sample data
// const users = [
//   {
//     username: "admin",
//     email: "admin@shopease.com",
//     password: "admin1234",
//     role: "admin",
//   },
//   {
//     username: "john_doe",
//     email: "john@example.com",
//     password: "password1234",
//     role: "user",
//   },
// ];

// // const products = [
// //   {
// //     name: "Wireless Bluetooth Headphones",
// //     description:
// //       "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
// //     price: 199.99,
// //     category: "Electronics",
// //     stock_quantity: 50,
// //     brand: "AudioTech",
// //     images: ["https://via.placeholder.com/400x400?text=Headphones"],
// //     featured: true,
// //   },
// //   {
// //     name: "Smart Fitness Watch",
// //     description:
// //       "Track your fitness goals with heart rate monitoring, GPS, and sleep tracking.",
// //     price: 299.99,
// //     category: "Electronics",
// //     stock_quantity: 30,
// //     brand: "FitGear",
// //     images: ["https://via.placeholder.com/400x400?text=Smart+Watch"],
// //     featured: true,
// //   },
// //   {
// //     name: "Organic Cotton T-Shirt",
// //     description:
// //       "Comfortable and sustainable organic cotton t-shirt in multiple colors.",
// //     price: 29.99,
// //     category: "Clothing",
// //     stock_quantity: 100,
// //     brand: "EcoWear",
// //     images: ["https://via.placeholder.com/400x400?text=T-Shirt"],
// //   },
// //   {
// //     name: "Yoga Mat Premium",
// //     description:
// //       "Non-slip yoga mat with extra cushioning for comfort during your practice.",
// //     price: 49.99,
// //     category: "Sports",
// //     stock_quantity: 75,
// //     brand: "YogaPro",
// //     images: ["https://via.placeholder.com/400x400?text=Yoga+Mat"],
// //   },
// //   {
// //     name: "LED Desk Lamp",
// //     description:
// //       "Adjustable LED desk lamp with multiple brightness levels and USB charging port.",
// //     price: 39.99,
// //     category: "Home & Garden",
// //     stock_quantity: 60,
// //     brand: "BrightHome",
// //     images: ["https://via.placeholder.com/400x400?text=Desk+Lamp"],
// //   },
// //   {
// //     name: "Stainless Steel Water Bottle",
// //     description:
// //       "Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.",
// //     price: 24.99,
// //     category: "Sports",
// //     stock_quantity: 120,
// //     brand: "HydroFlask",
// //     images: ["https://via.placeholder.com/400x400?text=Water+Bottle"],
// //     featured: true,
// //   },
// //   {
// //     name: "Programming Book Bundle",
// //     description:
// //       "Complete guide to modern web development with JavaScript, React, and Node.js.",
// //     price: 79.99,
// //     category: "Books",
// //     stock_quantity: 40,
// //     brand: "TechPress",
// //     images: ["https://via.placeholder.com/400x400?text=Book+Bundle"],
// //   },
// //   {
// //     name: "Wireless Gaming Mouse",
// //     description:
// //       "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
// //     price: 69.99,
// //     category: "Electronics",
// //     stock_quantity: 45,
// //     brand: "GamePro",
// //     images: ["https://via.placeholder.com/400x400?text=Gaming+Mouse"],
// //   },
// //   {
// //     name: "Aromatherapy Diffuser",
// //     description:
// //       "Ultrasonic essential oil diffuser with LED mood lighting and auto shut-off.",
// //     price: 34.99,
// //     category: "Home & Garden",
// //     stock_quantity: 80,
// //     brand: "ZenHome",
// //     images: ["https://via.placeholder.com/400x400?text=Diffuser"],
// //   },
// //   {
// //     name: "Resistance Bands Set",
// //     description:
// //       "Complete set of resistance bands for strength training and physical therapy.",
// //     price: 19.99,
// //     category: "Sports",
// //     stock_quantity: 90,
// //     brand: "FitnessPro",
// //     images: ["https://via.placeholder.com/400x400?text=Resistance+Bands"],
// //   },
// // ];

// // Connect to database

// const products = [
//   {
//     name: "Wireless Bluetooth Headphones",
//     description:
//       "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
//     price: 199.99,
//     category: "Electronics",
//     stock_quantity: 50,
//     brand: "AudioTech",
//     images: ["http://localhost:5000/images/product10.jpg"],
//     featured: true,
//   },
//   {
//     name: "Smart Fitness Watch",
//     description:
//       "Track your fitness goals with heart rate monitoring, GPS, and sleep tracking.",
//     price: 299.99,
//     category: "Electronics",
//     stock_quantity: 30,
//     brand: "FitGear",
//     images: ["http://localhost:5000/images/product5.jpg"],
//     featured: true,
//   },
//   {
//     name: "Organic Cotton T-Shirt",
//     description:
//       "Comfortable and sustainable organic cotton t-shirt in multiple colors.",
//     price: 29.99,
//     category: "Clothing",
//     stock_quantity: 100,
//     brand: "EcoWear",
//     images: ["http://localhost:5000/images/product6.jpg"],
//   },
//   {
//     name: "Yoga Mat Premium",
//     description:
//       "Non-slip yoga mat with extra cushioning for comfort during your practice.",
//     price: 49.99,
//     category: "Sports",
//     stock_quantity: 75,
//     brand: "YogaPro",
//     images: ["http://localhost:5000/images/product7.webp"],
//   },
//   {
//     name: "LED Desk Lamp",
//     description:
//       "Adjustable LED desk lamp with multiple brightness levels and USB charging port.",
//     price: 39.99,
//     category: "Home & Garden",
//     stock_quantity: 60,
//     brand: "BrightHome",
//     images: ["http://localhost:5000/images/product8.jpg"],
//   },
//   {
//     name: "Stainless Steel Water Bottle",
//     description:
//       "Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.",
//     price: 24.99,
//     category: "Sports",
//     stock_quantity: 120,
//     brand: "HydroFlask",
//     images: ["http://localhost:5000/images/product9.webp"],
//     featured: true,
//   },
//   {
//     name: "Programming Book Bundle",
//     description:
//       "Complete guide to modern web development with JavaScript, React, and Node.js.",
//     price: 79.99,
//     category: "Books",
//     stock_quantity: 40,
//     brand: "TechPress",
//     images: ["http://localhost:5000/images/product1.jpg"],
//   },
//   {
//     name: "Wireless Gaming Mouse",
//     description:
//       "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
//     price: 69.99,
//     category: "Electronics",
//     stock_quantity: 45,
//     brand: "GamePro",
//     images: ["http://localhost:5000/images/product2.jpg"],
//   },
//   {
//     name: "Aromatherapy Diffuser",
//     description:
//       "Ultrasonic essential oil diffuser with LED mood lighting and auto shut-off.",
//     price: 34.99,
//     category: "Home & Garden",
//     stock_quantity: 80,
//     brand: "ZenHome",
//     images: ["http://localhost:5000/images/product3.jpg"],
//   },
//   {
//     name: "Resistance Bands Set",
//     description:
//       "Complete set of resistance bands for strength training and physical therapy.",
//     price: 19.99,
//     category: "Sports",
//     stock_quantity: 90,
//     brand: "FitnessPro",
//     images: ["http://localhost:5000/images/product4.webp"],
//   },
// ];

// mongoose.connect(process.env.MONGODB_URI);

// // Seed function
// const seedDatabase = async () => {
//   try {
//     // Clear existing data
//     await User.deleteMany();
//     await Product.deleteMany();
//     console.log("🗑️  Cleared existing data");

//     // Hash passwords before inserting users
//     for (let user of users) {
//       user.password = await bcrypt.hash(user.password, 10);
//     }

//     // Insert users
//     const createdUsers = await User.insertMany(users);
//     console.log("✅ Users seeded");

//     // Insert products
//     const createdProducts = await Product.insertMany(products);
//     console.log("✅ Products seeded");

//     console.log("🎉 Database seeded successfully!");
//     process.exit();
//   } catch (error) {
//     console.error("❌ Error seeding database:", error);
//     process.exit(1);
//   }
// };

// // Run seeder
// seedDatabase();
