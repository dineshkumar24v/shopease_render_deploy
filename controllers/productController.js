const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
console.log("✅ ENV TEST:", process.env.CLOUDINARY_NAME, process.env.CLOUDINARY_KEY ? "Loaded" : "Missing");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Product = require("../models/Product");

// Multer setup (temporary storage)
const upload = multer({ dest: "uploads/" });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

console.log(
  "CLOUDINARY CONFIG:",
  process.env.CLOUDINARY_NAME ? "✅ Loaded" : "❌ Missing"
);

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Search by name or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by brand
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Filter featured products
    if (req.query.featured === "true") {
      query.featured = true;
    }

    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort;
      if (sortField === "price-asc") sort.price = 1;
      else if (sortField === "price-desc") sort.price = -1;
      else if (sortField === "rating") sort["ratings.average"] = -1;
      else if (sortField === "newest") sort.createdAt = -1;
      else sort.createdAt = -1;
    } else {
      sort.createdAt = -1;
    }

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "reviews",
      populate: { path: "user", select: "username avatar" },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.secure_url);
        fs.unlinkSync(file.path); // remove temp file
      }
    }

    const product = await Product.create({
      ...req.body,
      images, // Cloudinary URLs here
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Prepare updated fields
    const updates = { ...req.body };

    // If a new image is uploaded, overwrite the old one
    if (req.file) {
      updates.image = req.file.path;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔹 OPTIONAL: Delete image from Cloudinary if you ever do hard deletes
    // Extract the public_id from the Cloudinary URL (if stored)
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`mern_products/${publicId}`);
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product brands
// @route   GET /api/products/brands/list
// @access  Public
exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand", { brand: { $ne: null } });

    res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
