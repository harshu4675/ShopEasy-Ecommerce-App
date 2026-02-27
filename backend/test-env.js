// test-env.js
require("dotenv").config();

console.log("=== ENVIRONMENT VARIABLES TEST ===");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
console.log("");
console.log("RAZORPAY_KEY_ID length:", process.env.RAZORPAY_KEY_ID?.length);
console.log(
  "RAZORPAY_KEY_SECRET length:",
  process.env.RAZORPAY_KEY_SECRET?.length,
);
console.log("");
console.log(
  "All env keys:",
  Object.keys(process.env).filter((key) => key.startsWith("RAZORPAY")),
);
