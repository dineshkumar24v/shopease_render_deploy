const Product = require("../models/Product");

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
    const product = await Product.create(req.body);

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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
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
