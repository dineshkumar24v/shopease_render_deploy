const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../utils/emailService");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phone,
      address,
    });

    // Send welcome email
    await sendWelcomeEmail(user);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// version 1


// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Generate JWT token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE || '7d'
//   });
// };

// // @desc    Register user
// // @route   POST /api/auth/register
// // @access  Public
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, phone, address } = req.body;

//     // Check if user exists
//     const userExists = await User.findOne({ $or: [{ email }, { username }] });

//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this email or username'
//       });
//     }

//     // Create user
//     const user = await User.create({
//       username,
//       email,
//       password,
//       phone,
//       address
//     });

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password'
//       });
//     }

//     // Check for user (include password for comparison)
//     const user = await User.findOne({ email }).select('+password');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get current logged in user
// // @route   GET /api/auth/me
// // @access  Private
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     res.status(200).json({
//       success: true,
//       user
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Update user profile
// // @route   PUT /api/auth/profile
// // @access  Private
// exports.updateProfile = async (req, res) => {
//   try {
//     const { username, email, phone, address } = req.body;

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { username, email, phone, address },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       user
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
