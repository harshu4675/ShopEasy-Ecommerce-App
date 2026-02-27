const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
          expired: true,
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10,
      );
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message: "Password was changed. Please login again.",
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

// Admin only middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
};

module.exports = auth;
module.exports.auth = auth;
module.exports.protect = auth;
module.exports.admin = admin;
