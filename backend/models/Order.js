const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: String,
  color: String,
  image: String,
});

const deliveryUpdateSchema = new mongoose.Schema({
  status: String,
  location: String,
  description: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["COD", "Razorpay", "UPI", "Card"],
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpayOrderId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },
  orderStatus: {
    type: String,
    enum: [
      "Placed",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
    default: "Placed",
  },
  deliveryUpdates: [deliveryUpdateSchema],
  expectedDelivery: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  couponApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `SE${Date.now()}${(count + 1).toString().padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
