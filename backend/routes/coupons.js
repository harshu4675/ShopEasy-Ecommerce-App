const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Get all active coupons (for users)
router.get("/", auth, async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).select("-usedCount -usageLimit");
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all coupons (Admin)
router.get("/all", auth, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create coupon (Admin)
router.post("/", auth, admin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      applicableCategories,
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      validFrom,
      validUntil,
      usageLimit: usageLimit || null,
      applicableCategories: applicableCategories || [],
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update coupon (Admin)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete coupon (Admin)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate coupon
router.post("/validate", auth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isValid()) {
      return res
        .status(400)
        .json({ message: "Coupon is expired or no longer valid" });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      coupon,
      discount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
