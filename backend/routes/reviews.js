const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reviews/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Get reviews by product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { product, rating, title, comment } = req.body;

    const existingReview = await Review.findOne({
      user: req.user._id,
      product: product,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Check if verified purchase
    const hasOrdered = await Order.findOne({
      user: req.user._id,
      "items.product": product,
      orderStatus: "Delivered",
    });

    const reviewData = {
      user: req.user._id,
      product,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!hasOrdered,
    };

    if (req.file) {
      reviewData.image = `/uploads/reviews/${req.file.filename}`;
    }

    const review = await Review.create(reviewData);

    // Update product rating
    const reviews = await Review.find({ product });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(product, {
      rating: avgRating.toFixed(1),
      numReviews: reviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name",
    );
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review (Admin)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      numReviews: reviews.length,
    });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews (Admin)
router.get("/all", auth, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
