const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("appliedCoupon");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: item.product.images[0],
    }));

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    let discount = 0;
    if (cart.appliedCoupon && cart.appliedCoupon.isValid()) {
      if (cart.appliedCoupon.discountType === "percentage") {
        discount = (subtotal * cart.appliedCoupon.discountValue) / 100;
        if (cart.appliedCoupon.maxDiscountAmount) {
          discount = Math.min(discount, cart.appliedCoupon.maxDiscountAmount);
        }
      } else {
        discount = cart.appliedCoupon.discountValue;
      }

      // Update coupon usage
      await Coupon.findByIdAndUpdate(cart.appliedCoupon._id, {
        $inc: { usedCount: 1 },
      });
    }

    const deliveryCharge = subtotal >= 999 ? 0 : 49;
    const totalAmount = subtotal - discount + deliveryCharge;

    // Calculate expected delivery (5-7 days)
    const expectedDelivery = new Date();
    expectedDelivery.setDate(
      expectedDelivery.getDate() + 5 + Math.floor(Math.random() * 3),
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      couponApplied: cart.appliedCoupon?._id,
      expectedDelivery,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
      deliveryUpdates: [
        {
          status: "Order Placed",
          description: "Your order has been placed successfully",
          timestamp: new Date(),
        },
      ],
    });

    // Update stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: "order",
      title: "Order Placed Successfully",
      message: `Your order #${order.orderId} has been placed successfully. Expected delivery by ${expectedDelivery.toLocaleDateString("en-IN")}`,
      orderId: order._id,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel order
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (
      ["Shipped", "Out for Delivery", "Delivered"].includes(order.orderStatus)
    ) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    order.orderStatus = "Cancelled";
    order.deliveryUpdates.push({
      status: "Cancelled",
      description: "Order cancelled by customer",
      timestamp: new Date(),
    });

    // Restore stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: "order",
      title: "Order Cancelled",
      message: `Your order #${order.orderId} has been cancelled successfully`,
      orderId: order._id,
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
