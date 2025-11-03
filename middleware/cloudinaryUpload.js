const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mern_products",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// Initialize Multer with Cloudinary storage
const upload = multer({ storage });

module.exports = upload;
