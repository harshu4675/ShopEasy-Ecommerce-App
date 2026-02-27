const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  device: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: [addressSchema],

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: String,
    emailVerificationExpire: Date,

    // Password Reset
    passwordResetOTP: String,
    passwordResetExpire: Date,

    // Refresh Tokens (for remember me)
    refreshTokens: [refreshTokenSchema],

    // Account Security
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    lastLogin: Date,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification OTP (6 digits)
userSchema.methods.generateEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  this.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Generate password reset OTP (6 digits)
userSchema.methods.generatePasswordResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

module.exports = mongoose.model("User", userSchema);
