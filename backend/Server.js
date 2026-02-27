const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// ⭐ Load environment variables FIRST - BEFORE any other requires
dotenv.config();

// 🔍 Debug: Check if ALL keys are loaded
console.log("\n========== Environment Check ==========");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log(
  "RAZORPAY_KEY_ID:",
  process.env.RAZORPAY_KEY_ID ? "✅ Loaded" : "❌ Missing",
);
console.log(
  "RAZORPAY_KEY_SECRET:",
  process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing",
);
console.log(
  "EMAIL_HOST:",
  process.env.EMAIL_HOST || "❌ Missing (default: smtp.gmail.com)",
);
console.log(
  "EMAIL_PORT:",
  process.env.EMAIL_PORT || "❌ Missing (default: 587)",
);
console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER ? `✅ ${process.env.EMAIL_USER}` : "❌ Missing",
);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "✅ ***SET***" : "❌ Missing",
);
console.log(
  "FRONTEND_URL:",
  process.env.FRONTEND_URL || "❌ Missing (default: http://localhost:5173)",
);
console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "✅ ***SET***" : "❌ Missing",
);
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ ***CONNECTED***" : "❌ Missing",
);
console.log("========================================\n");

// ⭐ NOW require routes (after dotenv is loaded)
const paymentRoutes = require("./routes/payment");

const app = express();

// Connect to database
connectDB();

const allowedOrigins = [
  "https://shopeasy-fashionstore.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== ROUTES ====================

// Auth Routes (use only one - the updated one with OTP)
app.use("/api/auth", require("./routes/auth")); // This should be your updated auth.js file

// Other Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/payment", paymentRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopEasy API is running",
    timestamp: new Date().toISOString(),
    config: {
      email: !!process.env.EMAIL_USER,
      razorpay: !!process.env.RAZORPAY_KEY_ID,
      nodeEnv: process.env.NODE_ENV || "development",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n========== ShopEasy Server ==========");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`,
  );
  console.log(
    `📧 Email service: ${process.env.EMAIL_USER ? `✅ ${process.env.EMAIL_USER}` : "❌ Not configured"}`,
  );
  console.log(
    `💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? "✅ Configured" : "❌ Not configured"}`,
  );
  console.log(
    `🗄️  Database: ${process.env.MONGODB_URI ? "✅ Connected" : "❌ Not configured"}`,
  );
  console.log("=====================================\n");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  // Close server & exit process
  process.exit(1);
});
