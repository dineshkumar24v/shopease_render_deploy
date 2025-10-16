const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  checkWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

// All wishlist routes are protected
router.use(protect);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.delete("/", clearWishlist);
router.post("/:productId/move-to-cart", moveToCart);
router.get("/check/:productId", checkWishlist);

module.exports = router;
