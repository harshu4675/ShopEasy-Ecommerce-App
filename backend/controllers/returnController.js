const Return = require("../models/Return");
const Order = require("../models/Order");

// @desc    Create return request
// @route   POST /api/returns
// @access  Private
exports.createReturn = async (req, res) => {
  try {
    const {
      orderId,
      items,
      returnReason,
      additionalComments,
      refundMethod,
      bankDetails,
    } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order is delivered
    if (order.orderStatus !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Can only return delivered orders" });
    }

    // Check if return already exists
    const existingReturn = await Return.findOne({ order: orderId });
    if (existingReturn) {
      return res
        .status(400)
        .json({ message: "Return request already exists for this order" });
    }

    // Calculate refund amount
    const refundAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    // Create return
    const returnRequest = await Return.create({
      order: orderId,
      user: req.user.id,
      items,
      returnReason,
      additionalComments,
      refundAmount,
      refundMethod,
      bankDetails: refundMethod === "Bank Transfer" ? bankDetails : undefined,
      pickupAddress: order.shippingAddress,
      timeline: [
        {
          status: "Pending",
          description: "Return request submitted",
        },
      ],
    });

    // Update order status
    order.orderStatus = "Returned";
    await order.save();

    res.status(201).json({
      success: true, // ✅ Added this
      message: "Return request created successfully",
      data: returnRequest,
    });
  } catch (error) {
    console.error("Create return error:", error);

    // ✅ Better error handling
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate return request detected",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get user's returns
// @route   GET /api/returns/my-returns
// @access  Private
exports.getMyReturns = async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user.id })
      .populate("order")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    console.error("Get my returns error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get return by ID
// @route   GET /api/returns/:id
// @access  Private
exports.getReturnById = async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id)
      .populate("order")
      .populate("user", "name email");

    if (!returnRequest) {
      return res.status(404).json({ message: "Return not found" });
    }

    // Check authorization
    if (
      returnRequest.user._id.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(returnRequest);
  } catch (error) {
    console.error("Get return error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all returns (Admin)
// @route   GET /api/returns/admin/all
// @access  Private/Admin
exports.getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate("order")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    console.error("Get all returns error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update return status (Admin)
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
exports.updateReturnStatus = async (req, res) => {
  try {
    const { returnStatus, adminNotes, rejectionReason } = req.body;

    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return not found" });
    }

    returnRequest.returnStatus = returnStatus;
    if (adminNotes) returnRequest.adminNotes = adminNotes;
    if (rejectionReason) returnRequest.rejectionReason = rejectionReason;

    // If refund completed, update order payment status
    if (returnStatus === "Refund Completed") {
      const order = await Order.findById(returnRequest.order);
      if (order) {
        order.paymentStatus = "Refunded";
        await order.save();
      }
    }

    await returnRequest.save();

    res.json({
      message: "Return status updated successfully",
      data: returnRequest,
    });
  } catch (error) {
    console.error("Update return status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Cancel return request
// @route   DELETE /api/returns/:id
// @access  Private
exports.cancelReturn = async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);

    if (!returnRequest) {
      return res.status(404).json({ message: "Return not found" });
    }

    // Check authorization
    if (returnRequest.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Can only cancel pending returns
    if (returnRequest.returnStatus !== "Pending") {
      return res
        .status(400)
        .json({ message: "Can only cancel pending returns" });
    }

    await returnRequest.deleteOne();

    // Update order status back to Delivered
    const order = await Order.findById(returnRequest.order);
    if (order) {
      order.orderStatus = "Delivered";
      await order.save();
    }

    res.json({ message: "Return request cancelled successfully" });
  } catch (error) {
    console.error("Cancel return error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
