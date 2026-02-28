const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// ==================== ADMIN ROUTES (MUST BE FIRST!) ====================

// Get all orders (Admin) - MUST be before /:id route
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    console.log(`✅ Admin fetched ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get order stats (Admin) - MUST be before /:id route
router.get("/admin/stats", auth, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: "Placed" });
    const processingOrders = await Order.countDocuments({
      orderStatus: "Processing",
    });
    const shippedOrders = await Order.countDocuments({
      orderStatus: "Shipped",
    });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "Delivered",
    });
    const cancelledOrders = await Order.countDocuments({
      orderStatus: "Cancelled",
    });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("❌ Get order stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER ROUTES ====================

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

      await Coupon.findByIdAndUpdate(cart.appliedCoupon._id, {
        $inc: { usedCount: 1 },
      });
    }

    const deliveryCharge = subtotal >= 199 ? 0 : 49;
    const totalAmount = subtotal - discount + deliveryCharge;

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

    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    await Notification.create({
      user: req.user._id,
      type: "order",
      title: "Order Placed Successfully",
      message: `Your order #${order.orderId} has been placed successfully. Expected delivery by ${expectedDelivery.toLocaleDateString("en-IN")}`,
      orderId: order._id,
    });

    console.log(`✅ Order created: ${order.orderId}`);
    res.status(201).json(order);
  } catch (error) {
    console.error("❌ Create order error:", error);
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
    console.error("❌ Get my orders error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single order - MUST be after /admin/* and /my-orders routes
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
    console.error("❌ Get order error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel order (User)
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

    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    await Notification.create({
      user: req.user._id,
      type: "order",
      title: "Order Cancelled",
      message: `Your order #${order.orderId} has been cancelled successfully`,
      orderId: order._id,
    });

    console.log(`✅ Order cancelled: ${order.orderId}`);
    res.json(order);
  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin)
router.put("/:id/status", auth, admin, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = [
      "Placed",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const statusMessages = {
      Placed: "Order has been placed",
      Confirmed: "Order has been confirmed by seller",
      Processing: "Order is being processed",
      Shipped: "Order has been shipped",
      "Out for Delivery": "Order is out for delivery",
      Delivered: "Order has been delivered successfully",
      Cancelled: "Order has been cancelled",
      Returned: "Order has been returned & refunded",
    };

    const updateData = {
      orderStatus: orderStatus,
      $push: {
        deliveryUpdates: {
          status: orderStatus,
          description:
            statusMessages[orderStatus] ||
            `Order status updated to ${orderStatus}`,
          timestamp: new Date(),
        },
      },
    };

    // If delivered and COD, mark payment as paid
    if (orderStatus === "Delivered") {
      // We'll handle this separately
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false }, // ✅ Skip validation for existing docs
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If delivered, set deliveredAt and update payment status for COD
    if (orderStatus === "Delivered") {
      const updateFields = { deliveredAt: new Date() }; // ✅ ADD THIS

      if (order.paymentMethod === "COD") {
        updateFields.paymentStatus = "Paid";
      }

      await Order.findByIdAndUpdate(req.params.id, updateFields, {
        runValidators: false,
      });

      order.deliveredAt = new Date(); // ✅ ADD THIS
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
      }
    }

    // If cancelled, restore stock
    if (orderStatus === "Cancelled") {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    try {
      const orderNumber =
        order.orderId || `ORD-${order._id.toString().slice(-8).toUpperCase()}`;

      await Notification.create({
        user: order.user._id || order.user,
        type: "order",
        title: `Order ${orderStatus}`,
        message: `Your order #${orderNumber} has been ${orderStatus.toLowerCase()}`,
        orderId: order._id,
      });
    } catch (notifError) {
      console.error("Notification error (non-critical):", notifError.message);
    }

    console.log(`✅ Order ${order.orderId} status updated to: ${orderStatus}`);
    res.json(order);
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({ message: error.message });
  }
}); // Update payment status (Admin)
router.put("/:id/payment-status", auth, admin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const validStatuses = ["Pending", "Paid", "Failed", "Refunded"];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    // ✅ FIX: Use findByIdAndUpdate instead of save()
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: paymentStatus,
        $push: {
          deliveryUpdates: {
            status: `Payment ${paymentStatus}`,
            description: `Payment status updated to ${paymentStatus}`,
            timestamp: new Date(),
          },
        },
      },
      { new: true, runValidators: false }, // ✅ Skip validation
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    try {
      const orderNumber =
        order.orderId || `ORD-${order._id.toString().slice(-8).toUpperCase()}`;

      await Notification.create({
        user: order.user._id || order.user,
        type: "order",
        title: `Payment ${paymentStatus}`,
        message: `Payment for order #${orderNumber} is ${paymentStatus.toLowerCase()}`,
        orderId: order._id,
      });
    } catch (notifError) {
      console.error("Notification error (non-critical):", notifError.message);
    }
    console.log(
      `✅ Order ${order.orderId} payment updated to: ${paymentStatus}`,
    );
    res.json(order);
  } catch (error) {
    console.error("❌ Update payment status error:", error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
