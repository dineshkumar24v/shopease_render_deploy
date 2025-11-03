require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");

// 🧩 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

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
  {
    name: "Smartphone 5G Ultra",
    description:
      "Latest 5G smartphone with edge-to-edge display, high-speed processor, and multiple cameras.",
    price: 899.99,
    category: "Electronics",
    stock_quantity: 35,
    brand: "PhoneMax",
    images: ["public/images/product11.jpg"],
    featured: true,
  },
  {
    name: "Leather Wallet",
    description:
      "Premium genuine leather wallet with multiple card slots and coin pocket.",
    price: 49.99,
    category: "Accessories",
    stock_quantity: 70,
    brand: "LuxStyle",
    images: ["public/images/product12.jpg"],
  },
  {
    name: "Electric Kettle",
    description:
      "1.7L electric kettle with fast boil, auto shut-off, and temperature control.",
    price: 39.99,
    category: "Home & Garden",
    stock_quantity: 60,
    brand: "KitchenPro",
    images: ["public/images/product13.jpg"],
  },
  {
    name: "Running Shoes",
    description:
      "Lightweight running shoes with breathable mesh and cushioned sole for long-distance comfort.",
    price: 89.99,
    category: "Sports",
    stock_quantity: 50,
    brand: "RunFast",
    images: ["public/images/product14.webp"],
    featured: true,
  },
  {
    name: "Noise Cancelling Earbuds",
    description:
      "Compact earbuds with active noise cancellation, long battery life, and crystal-clear sound.",
    price: 129.99,
    category: "Electronics",
    stock_quantity: 40,
    brand: "SoundMagic",
    images: ["public/images/product15.webp"],
  },
  {
    name: "Ceramic Dinnerware Set",
    description:
      "12-piece dinnerware set made from durable ceramic, dishwasher safe, and stylish design.",
    price: 79.99,
    category: "Home & Garden",
    stock_quantity: 30,
    brand: "HomeElegance",
    images: ["public/images/product16.webp"],
  },
  {
    name: "Bluetooth Speaker",
    description:
      "Portable Bluetooth speaker with deep bass, waterproof design, and 12-hour battery life.",
    price: 59.99,
    category: "Electronics",
    stock_quantity: 55,
    brand: "BeatBox",
    images: ["public/images/product17.jpg"],
    featured: true,
  },
  {
    name: "Men's Casual Shirt",
    description:
      "Slim-fit casual shirt made from breathable cotton, perfect for daily wear.",
    price: 34.99,
    category: "Clothing",
    stock_quantity: 80,
    brand: "UrbanStyle",
    images: ["public/images/product18.jpg"],
  },
  {
    name: "Stainless Steel Cookware Set",
    description:
      "10-piece stainless steel cookware set with lids, induction compatible, and durable construction.",
    price: 149.99,
    category: "Home & Garden",
    stock_quantity: 25,
    brand: "ChefMaster",
    images: ["public/images/product19.jpg"],
  },
  {
    name: "Fitness Smart Scale",
    description:
      "Smart digital scale measures weight, BMI, and body composition with Bluetooth connectivity.",
    price: 69.99,
    category: "Sports",
    stock_quantity: 45,
    brand: "FitTrack",
    images: ["public/images/product20.jpg"],
  },
  {
    name: "Men's Casual Trouser",
    description:
      "Slim-fit casual trouser made from breathable cotton, perfect for daily wear.",
    price: 39.99,
    category: "Clothing",
    stock_quantity: 70,
    brand: "UrbanStyle",
    images: ["public/images/product21.jpg"],
  },
  {
    name: "Men's Jeans",
    description:
      "Slim-fit Jeans made from breathable cotton, perfect for daily wear.",
    price: 44.99,
    category: "Clothing",
    stock_quantity: 70,
    brand: "UrbanStyle",
    images: ["public/images/product22.webp"],
  },
  {
    name: "Men's track pant",
    description:
      "Slim-fit track pant made from breathable cotton, perfect for daily wear.",
    price: 24.99,
    category: "Clothing",
    stock_quantity: 90,
    brand: "UrbanStyle",
    images: ["public/images/product23.jpg"],
  },
  {
    name: "Men's Jacket",
    description:
      "Men's Jacket made from breathable cotton, perfect for daily wear.",
    price: 54.99,
    category: "Clothing",
    stock_quantity: 90,
    brand: "UrbanStyle",
    images: ["public/images/product24.avif"],
  },
  {
    name: "Men's Winter Jacket",
    description:
      "Men's Winter Jacket made from breathable fabric, perfect for daily wear.",
    price: 66.99,
    category: "Clothing",
    stock_quantity: 40,
    brand: "UrbanStyle",
    images: ["public/images/product25.jpg"],
  },
  {
    name: "UPSC Book Bundle",
    description: "Complete guide to UPSC Civil Services guide",
    price: 64.99,
    category: "Books",
    stock_quantity: 40,
    brand: "TechPress",
    images: ["public/images/product26.webp"],
  },
  {
    name: "Indian Polity by Laxmikanth",
    description: "Complete guide to UPSC Civil Services guide",
    price: 18.99,
    category: "Books",
    stock_quantity: 40,
    brand: "TechPress",
    images: ["public/images/product27.jpg"],
  },
  {
    name: "C++ by Bjarne Stroustrup",
    description: "Complete guide to C++ Programming Language",
    price: 21.99,
    category: "Books",
    stock_quantity: 40,
    brand: "TechPress",
    images: ["public/images/product28.jpg"],
  },
  {
    name: "BENYAR Men's Watch",
    description: "Premium genuine BENYAR Men's Luxury Chronograph Watch",
    price: 79.99,
    category: "Accessories",
    stock_quantity: 30,
    brand: "LuxStyle",
    images: ["public/images/product29.jpg"],
  },
  {
    name: "Brass Gold-plated Kadah",
    description: "Premium genuine Voylla Brass Gold-plated Kada",
    price: 23.99,
    category: "Accessories",
    stock_quantity: 20,
    brand: "LuxStyle",
    images: ["public/images/product30.webp"],
  },
];

// 🔗 Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// 🌱 Seed Function
const seedDatabase = async () => {
  try {
    console.log("🔗 Preparing to seed database...");

    // 1️⃣ Clear Products
    await Product.deleteMany();
    console.log("🗑️  Cleared existing products");

    // 3️⃣ Upload Images to Cloudinary
    const uploadedProducts = [];

    for (const product of products) {
      const uploadedImages = [];

      for (const img of product.images) {
        try {
          const filePath = path.join(__dirname, "..", img);
          console.log("📸 Uploading:", filePath);

          // Create a safe public_id for Cloudinary based on product name
          const publicIdBase = product.name.replace(/\s+/g, "_").toLowerCase();

          const result = await cloudinary.uploader.upload(filePath, {
            folder: "ShopEase/products",
            public_id: path.basename(img, path.extname(img)), // same name
            overwrite: true, // replaces old one
          });

          uploadedImages.push(result.secure_url);
          console.log("✅ Uploaded:", result.secure_url);
        } catch (err) {
          console.error(`❌ Upload failed for ${img}:`, err.message);
        }
      }

      uploadedProducts.push({ ...product, images: uploadedImages });
    }

    // 4️⃣ Insert Products into MongoDB
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
