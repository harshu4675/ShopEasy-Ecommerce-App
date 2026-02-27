const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// Get user notifications
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete notification
router.delete("/:id", auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
