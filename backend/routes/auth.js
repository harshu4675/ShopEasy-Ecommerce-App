const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendEmail } = require("../utils/emailService");

// ==================== HELPER FUNCTIONS ====================

// Generate Access Token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRE || "30d"
    : process.env.JWT_REFRESH_EXPIRE || "7d";

  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
  });
};

// Hash token for storage
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Cookie options
const getCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
});

// ==================== PUBLIC ROUTES ====================

// @desc    Register user & send OTP
// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already registered. Please login.",
        });
      }

      // User exists but not verified - resend OTP
      const otp = user.generateEmailVerificationOTP();
      await user.save();

      // ✅ SEND EMAIL IN BACKGROUND - DON'T AWAIT
      sendEmail(email, "verificationOTP", name, otp).catch((err) =>
        console.error("Email send error:", err),
      );

      return res.status(200).json({
        success: true,
        message: "OTP resent to your email",
        data: { email, requiresVerification: true },
      });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      password,
      phone,
    });

    // Generate and send OTP
    const otp = user.generateEmailVerificationOTP();
    await user.save();

    // ✅ SEND EMAIL IN BACKGROUND - DON'T AWAIT
    sendEmail(email, "verificationOTP", name, otp).catch((err) =>
      console.error("Email send error:", err),
    );

    // ✅ RESPOND IMMEDIATELY
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for OTP.",
      data: { email, requiresVerification: true },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
});

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      emailVerificationOTP: hashedOTP,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Verify user
    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpire = undefined;

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({
      token: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      device: req.headers["user-agent"],
    });

    await user.save();

    // ✅ SEND WELCOME EMAIL IN BACKGROUND
    sendEmail(email, "welcomeEmail", user.name).catch((err) =>
      console.error("Welcome email error:", err),
    );

    // Set cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and type",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let otp;
    if (type === "verification") {
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already verified",
        });
      }
      otp = user.generateEmailVerificationOTP();
      await user.save();

      // ✅ SEND EMAIL IN BACKGROUND
      sendEmail(email, "verificationOTP", user.name, otp).catch((err) =>
        console.error("Email error:", err),
      );
    } else if (type === "reset") {
      otp = user.generatePasswordResetOTP();
      await user.save();

      // ✅ SEND EMAIL IN BACKGROUND
      sendEmail(email, "passwordResetOTP", user.name, otp).catch((err) =>
        console.error("Email error:", err),
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP type",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${lockTime} minutes`,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();
        return res.status(423).json({
          success: false,
          message:
            "Account locked for 15 minutes due to too many failed attempts",
        });
      }

      await user.save();
      const attemptsLeft = 5 - user.loginAttempts;

      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${attemptsLeft} attempts left`,
      });
    }

    // Check if verified
    if (!user.isVerified) {
      // Send new OTP
      const otp = user.generateEmailVerificationOTP();
      await user.save();

      // ✅ SEND EMAIL IN BACKGROUND
      sendEmail(email, "verificationOTP", user.name, otp).catch((err) =>
        console.error("Email error:", err),
      );

      return res.status(403).json({
        success: false,
        message: "Please verify your email first. OTP sent.",
        data: { email, requiresVerification: true },
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();

    // Clean expired tokens
    if (user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.expiresAt > Date.now(),
      );
    } else {
      user.refreshTokens = [];
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id, rememberMe);

    // Calculate expiry
    const tokenExpiry = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Store refresh token
    user.refreshTokens.push({
      token: hashToken(refreshToken),
      expiresAt: tokenExpiry,
      device: req.headers["user-agent"],
    });

    await user.save();

    // Set cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions(rememberMe));

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        accessToken,
        rememberMe,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists (security)
      return res.status(200).json({
        success: true,
        message: "If the email exists, you will receive an OTP",
      });
    }

    // Generate OTP
    const otp = user.generatePasswordResetOTP();
    await user.save();

    // ✅ SEND EMAIL IN BACKGROUND
    sendEmail(email, "passwordResetOTP", user.name, otp).catch((err) =>
      console.error("Email error:", err),
    );

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
      data: { email },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
    });
  }
});

// @desc    Verify reset OTP
// @route   POST /api/auth/verify-reset-otp
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetOTP: hashedOTP,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Generate reset token for password change
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetOTP = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified",
      data: { resetToken, email },
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;

    if (!email || !resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, reset token, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      email,
      passwordResetOTP: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.passwordResetOTP = undefined;
    user.passwordResetExpire = undefined;
    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();

    // ✅ SEND EMAIL IN BACKGROUND
    sendEmail(user.email, "passwordChanged", user.name).catch((err) =>
      console.error("Email error:", err),
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Find user and validate token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedToken = hashToken(refreshToken);
    const tokenExists =
      user.refreshTokens &&
      user.refreshTokens.find(
        (t) => t.token === hashedToken && t.expiresAt > Date.now(),
      );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: "Token expired or revoked",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
});

// ==================== PROTECTED ROUTES ====================

// @desc    Get current user
// @route   GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          isVerified: req.user.isVerified,
          addresses: req.user.addresses,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

// @desc    Update profile
// @route   PUT /api/auth/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();

    // ✅ SEND EMAIL IN BACKGROUND
    sendEmail(user.email, "passwordChanged", user.name).catch((err) =>
      console.error("Email error:", err),
    );

    // Clear cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});

// @desc    Add address
// @route   POST /api/auth/address
router.post("/address", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: { addresses: user.addresses },
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
});

// @desc    Update address
// @route   PUT /api/auth/address/:id
router.put("/address/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: { addresses: user.addresses },
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/auth/address/:id
router.delete("/address/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.id);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: { addresses: user.addresses },
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
});

// @desc    Logout
// @route   POST /api/auth/logout
router.post("/logout", auth, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: hashedToken } },
      });
    }

    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});

module.exports = router;
