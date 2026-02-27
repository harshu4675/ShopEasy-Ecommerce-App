const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate refresh token
const generateRefreshToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRE
    : process.env.JWT_REFRESH_EXPIRE;

  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
  });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Hash token for storage
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
