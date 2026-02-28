const express = require("express");
const router = express.Router();
const {
  createReturn,
  getMyReturns,
  getReturnById,
  getAllReturns,
  updateReturnStatus,
  cancelReturn,
} = require("../controllers/returnController");
const { protect, admin } = require("../middleware/auth");

// User routes
router.post("/", protect, createReturn);
router.get("/my-returns", protect, getMyReturns);
router.get("/:id", protect, getReturnById);
router.delete("/:id", protect, cancelReturn);

// Admin routes
router.get("/admin/all", protect, admin, getAllReturns);
router.put("/:id/status", protect, admin, updateReturnStatus);

module.exports = router;
