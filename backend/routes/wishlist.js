const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const auth = require("../middleware/auth");

// Get wishlist
router.get("/", auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post("/add/:productId", auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(req.params.productId)) {
      wishlist.products.push(req.params.productId);
      wishlist.updatedAt = Date.now();
      await wishlist.save();
    }

    wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId,
    );
    wishlist.updatedAt = Date.now();
    await wishlist.save();

    const updatedWishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("products");
    res.json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
