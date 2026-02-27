const Razorpay = require("razorpay");

// Check if environment variables are loaded
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ ERROR: Razorpay credentials missing in .env file");
  console.error("Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
  process.exit(1); // Stop server if keys missing
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("✅ Razorpay initialized successfully");

module.exports = razorpayInstance;
