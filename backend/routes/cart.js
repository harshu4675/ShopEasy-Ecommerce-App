const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const auth = require("../middleware/auth");

// Get cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("appliedCoupon");

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to cart
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("appliedCoupon");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update quantity
router.put("/update", auth, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color,
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("appliedCoupon");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const { size, color } = req.query;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === req.params.productId &&
          item.size === size &&
          item.color === color
        ),
    );

    cart.updatedAt = Date.now();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("appliedCoupon");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply coupon
router.post("/apply-coupon", auth, async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isValid()) {
      return res
        .status(400)
        .json({ message: "Coupon is expired or no longer valid" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    cart.appliedCoupon = coupon._id;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("appliedCoupon");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove coupon
router.delete("/remove-coupon", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.appliedCoupon = null;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    cart.updatedAt = Date.now();
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
