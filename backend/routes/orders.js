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

// Get all orders (Admin)
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
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
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

// Get order stats (Admin)
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

    // ✅ NEW: Refund stats
    const refundRequested = await Order.countDocuments({
      paymentStatus: "Refund Requested",
    });
    const refunded = await Order.countDocuments({
      paymentStatus: "Refunded",
    });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid", orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRefunded = await Order.aggregate([
      { $match: { paymentStatus: "Refunded" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundRequested,
      refunded,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalRefunded: totalRefunded[0]?.total || 0,
    });
  } catch (error) {
    console.error("❌ Get order stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ NEW: Get refund requests (Admin)
router.get("/admin/refund-requests", auth, admin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = {
      "refundDetails.bankDetails": { $exists: true },
    };

    if (status === "pending") {
      query.paymentStatus = "Refund Requested";
    } else if (status === "completed") {
      query.paymentStatus = "Refunded";
    } else {
      query.paymentStatus = { $in: ["Refund Requested", "Refunded"] };
    }

    const refundRequests = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ "refundDetails.refundInitiatedAt": -1 });

    console.log(`✅ Admin fetched ${refundRequests.length} refund requests`);
    res.json(refundRequests);
  } catch (error) {
    console.error("❌ Get refund requests error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER ROUTES ====================

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("appliedCoupon");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check if all products exist and have stock
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          message: "Some products in your cart are no longer available",
        });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.product.name} has only ${item.product.stock} items in stock`,
        });
      }
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

    // ✅ Determine payment status based on payment method
    let paymentStatus = "Pending";
    if (paymentMethod === "Razorpay" && razorpayPaymentId) {
      paymentStatus = "Paid";
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      couponApplied: cart.appliedCoupon?._id,
      expectedDelivery,
      paymentStatus,
      deliveryUpdates: [
        {
          status: "Order Placed",
          description: `Your order has been placed successfully${paymentStatus === "Paid" ? " and payment received" : ""}`,
          timestamp: new Date(),
        },
      ],
    });

    // Reduce stock
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
      message: `Your order #${order.orderId} has been placed successfully. ${paymentStatus === "Paid" ? "Payment received ✓" : "Payment: COD"} Expected delivery by ${expectedDelivery.toLocaleDateString("en-IN")}`,
      orderId: order._id,
    });

    console.log(
      `✅ Order created: ${order.orderId} | Payment: ${paymentStatus}`,
    );
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
    console.error("❌ Get order error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Cancel order (User) - UPDATED
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
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
      return res.status(400).json({
        message:
          "Order cannot be cancelled at this stage. Please request a return instead.",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Check if order was paid
    const wasPaid = order.paymentStatus === "Paid";

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    order.deliveryUpdates.push({
      status: "Cancelled",
      description: cancellationReason || "Order cancelled by customer",
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
    let notificationMessage = `Your order #${order.orderId} has been cancelled successfully.`;
    if (wasPaid) {
      notificationMessage +=
        " Please submit your bank details to receive your refund.";
    }

    await Notification.create({
      user: req.user._id,
      type: "order",
      title: "Order Cancelled",
      message: notificationMessage,
      orderId: order._id,
    });

    console.log(`✅ Order cancelled: ${order.orderId} | Was Paid: ${wasPaid}`);

    res.json({
      success: true,
      order,
      requiresBankDetails: wasPaid, // ✅ Tell frontend if bank details needed
      message: wasPaid
        ? "Order cancelled. Please submit bank details for refund."
        : "Order cancelled successfully.",
    });
  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ NEW: Submit bank details for refund
router.post("/:id/refund-bank-details", auth, async (req, res) => {
  try {
    const {
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      bankName,
      upiId,
    } = req.body;

    // Validation
    if (!accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        message:
          "Account holder name, account number, and IFSC code are required",
      });
    }

    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ message: "Account numbers do not match" });
    }

    // IFSC validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      return res.status(400).json({ message: "Invalid IFSC code format" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.orderStatus !== "Cancelled") {
      return res
        .status(400)
        .json({ message: "Order must be cancelled to request refund" });
    }

    if (order.paymentStatus !== "Paid") {
      return res
        .status(400)
        .json({ message: "Only paid orders can request refund" });
    }

    if (
      order.paymentStatus === "Refund Requested" ||
      order.paymentStatus === "Refunded"
    ) {
      return res
        .status(400)
        .json({ message: "Refund already requested/processed for this order" });
    }

    // Update order with bank details
    order.refundDetails = {
      bankDetails: {
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.toUpperCase().trim(),
        bankName: bankName?.trim() || "",
        upiId: upiId?.trim() || "",
        submittedAt: new Date(),
      },
      refundAmount: order.totalAmount,
      refundInitiatedAt: new Date(),
    };

    order.paymentStatus = "Refund Requested";

    order.deliveryUpdates.push({
      status: "Refund Requested",
      description: "Bank details submitted for refund processing",
      timestamp: new Date(),
    });

    await order.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: "order",
      title: "Refund Request Submitted",
      message: `Your refund request for order #${order.orderId} has been submitted. Amount: ₹${order.totalAmount}. We will process it within 5-7 business days.`,
      orderId: order._id,
    });

    console.log(`✅ Refund bank details submitted for order: ${order.orderId}`);

    res.json({
      success: true,
      message:
        "Refund request submitted successfully. Your refund will be processed within 5-7 business days.",
      order,
    });
  } catch (error) {
    console.error("❌ Submit refund bank details error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ NEW: Process refund (Admin)
router.put("/:id/process-refund", auth, admin, async (req, res) => {
  try {
    const { refundTransactionId, refundNotes } = req.body;

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "Refund Requested") {
      return res
        .status(400)
        .json({ message: "No pending refund request for this order" });
    }

    // Update refund status
    order.paymentStatus = "Refunded";
    order.refundDetails.refundCompletedAt = new Date();
    order.refundDetails.refundTransactionId =
      refundTransactionId || `REF${Date.now()}`;
    order.refundDetails.refundNotes =
      refundNotes || "Refund processed successfully";

    order.deliveryUpdates.push({
      status: "Refund Completed",
      description: `Refund of ₹${order.totalAmount} processed successfully. Transaction ID: ${order.refundDetails.refundTransactionId}`,
      timestamp: new Date(),
    });

    await order.save();

    // Create notification for user
    await Notification.create({
      user: order.user._id,
      type: "order",
      title: "Refund Processed ✓",
      message: `Your refund of ₹${order.totalAmount} for order #${order.orderId} has been processed successfully. Transaction ID: ${order.refundDetails.refundTransactionId}`,
      orderId: order._id,
    });

    console.log(`✅ Refund processed for order: ${order.orderId}`);

    res.json({
      success: true,
      message: "Refund processed successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Process refund error:", error);
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
      Returned: "Order has been returned",
    };

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;

    order.deliveryUpdates.push({
      status: orderStatus,
      description:
        statusMessages[orderStatus] || `Order status updated to ${orderStatus}`,
      timestamp: new Date(),
    });

    // Handle specific status updates
    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
      }
    }

    if (orderStatus === "Cancelled") {
      order.cancelledAt = new Date();
      // Restore stock
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    // Create notification
    try {
      await Notification.create({
        user: order.user._id || order.user,
        type: "order",
        title: `Order ${orderStatus}`,
        message: `Your order #${order.orderId} has been ${orderStatus.toLowerCase()}`,
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
});

// Update payment status (Admin)
router.put("/:id/payment-status", auth, admin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const validStatuses = [
      "Pending",
      "Paid",
      "Failed",
      "Refund Requested",
      "Refunded",
    ];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

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
      { new: true, runValidators: false },
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create notification
    try {
      await Notification.create({
        user: order.user._id || order.user,
        type: "order",
        title: `Payment ${paymentStatus}`,
        message: `Payment for order #${order.orderId} is ${paymentStatus.toLowerCase()}`,
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
