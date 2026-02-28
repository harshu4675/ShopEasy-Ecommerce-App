import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { returnsAPI, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import "../styles/Returns.css";

const ReturnRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Add state for order and validation
  const [order, setOrder] = useState(null);
  const [isValidating, setIsValidating] = useState(true);

  const [selectedItems, setSelectedItems] = useState([]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [refundMethod, setRefundMethod] = useState("Original Payment Method");
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(false);

  const returnReasons = [
    "Defective Product",
    "Wrong Item Received",
    "Not as Described",
    "Size/Fit Issue",
    "Changed Mind",
    "Better Price Available",
    "Other",
  ];

  // ✅ Single useEffect at the TOP - before any returns
  useEffect(() => {
    const orderData = location.state?.order;
    console.log("📦 Full Order Data:", orderData);
    console.log("📅 Date fields:", {
      deliveredAt: orderData?.deliveredAt,
      updatedAt: orderData?.updatedAt,
      createdAt: orderData?.createdAt,
    });
    if (!orderData) {
      showToast("No order selected", "error");
      navigate("/my-orders", { replace: true });
      return;
    }

    if (orderData.orderStatus !== "Delivered") {
      showToast("Only delivered orders can be returned", "error");
      navigate("/my-orders", { replace: true });
      return;
    }
    // Check 7-day window - Use available date fields
    const deliveryDateString =
      orderData.deliveredAt || orderData.updatedAt || orderData.createdAt;

    if (!deliveryDateString) {
      showToast("Order date not found", "error");
      navigate("/my-orders", { replace: true });
      return;
    }

    const deliveryDate = new Date(deliveryDateString);

    // Validate date
    if (isNaN(deliveryDate.getTime())) {
      showToast("Invalid order date", "error");
      navigate("/my-orders", { replace: true });
      return;
    }

    const today = new Date();
    const daysSinceDelivery = Math.floor(
      (today - deliveryDate) / (1000 * 60 * 60 * 24),
    );

    console.log("📅 Date validation:", {
      deliveredAt: orderData.deliveredAt,
      updatedAt: orderData.updatedAt,
      createdAt: orderData.createdAt,
      usingDate: deliveryDateString,
      daysSince: daysSinceDelivery,
    });

    if (daysSinceDelivery > 7) {
      showToast("Return window has expired (7 days from delivery)", "error");
      navigate("/my-orders", { replace: true });
      return;
    }
    setOrder(orderData);
    setIsValidating(false);
  }, [location.state, navigate]);

  const handleItemSelect = (item, reason) => {
    const productId = item.product._id || item.product;
    const itemIndex = selectedItems.findIndex((i) => i.product === productId);

    if (itemIndex > -1) {
      if (reason) {
        const updated = [...selectedItems];
        updated[itemIndex].reason = reason;
        setSelectedItems(updated);
      } else {
        setSelectedItems(selectedItems.filter((_, i) => i !== itemIndex));
      }
    } else if (reason) {
      setSelectedItems([
        ...selectedItems,
        {
          product: productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
          reason: reason,
        },
      ]);
    }
  };

  const isItemSelected = (item) => {
    const productId = item.product._id || item.product;
    return selectedItems.some((i) => i.product === productId);
  };

  const getItemReason = (item) => {
    const productId = item.product._id || item.product;
    return selectedItems.find((i) => i.product === productId)?.reason || "";
  };

  const calculateRefundAmount = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 Submit clicked");

    if (selectedItems.length === 0) {
      showToast("Please select at least one item to return", "error");
      return;
    }

    if (refundMethod === "Bank Transfer") {
      if (
        !bankDetails.accountHolderName ||
        !bankDetails.accountNumber ||
        !bankDetails.ifscCode ||
        !bankDetails.bankName
      ) {
        showToast("Please fill all bank details", "error");
        return;
      }
    }

    setLoading(true);
    console.log("🔄 Loading set to true");

    try {
      const returnData = {
        orderId: order._id,
        items: selectedItems,
        returnReason: selectedItems[0]?.reason || "Other", // ✅ Use first item's reason
        additionalComments,
        refundMethod,
        bankDetails: refundMethod === "Bank Transfer" ? bankDetails : undefined,
      };

      console.log("📦 Sending data:", returnData);

      const response = await returnsAPI.create(returnData);

      console.log("✅ Response received:", response);

      showToast("Return request submitted successfully", "success");
      navigate("/my-returns", { replace: true });
    } catch (error) {
      console.error("❌ Return request error:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error data:", error.response?.data);

      showToast(
        error.response?.data?.message || "Error submitting return request",
        "error",
      );
    } finally {
      console.log("🏁 Finally block - setting loading to false");
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (isValidating) {
    return (
      <div className="return-request-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ No order state
  if (!order) {
    return null;
  }

  return (
    <div className="return-request-page">
      <div className="container">
        <div className="return-request-header">
          <button
            className="back-button"
            onClick={() => navigate("/my-orders")}
            type="button"
          >
            ← Back to Orders
          </button>
          <h1>Return Request</h1>
          <p>Order #{order.orderId}</p>
        </div>

        <form onSubmit={handleSubmit} className="return-request-form">
          {/* Step 1: Select Items */}
          <div className="form-section">
            <h3>1. Select Items to Return</h3>
            <div className="items-selection">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className={`item-card ${isItemSelected(item) ? "selected" : ""}`}
                >
                  <div className="item-header">
                    <input
                      type="checkbox"
                      checked={isItemSelected(item)}
                      onChange={(e) =>
                        handleItemSelect(
                          item,
                          e.target.checked ? returnReasons[0] : "",
                        )
                      }
                    />
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-options">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && " | "}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                      <p className="item-price">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {isItemSelected(item) && (
                    <div className="item-reason">
                      <label>Reason for return:</label>
                      <select
                        value={getItemReason(item)}
                        onChange={(e) => handleItemSelect(item, e.target.value)}
                        required
                      >
                        {returnReasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Comments moved here */}
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Additional Comments (Optional)</label>
              <textarea
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Provide additional details about the return..."
                rows="4"
                className="form-textarea"
              />
            </div>
          </div>

          {/* Step 2: Refund Method */}
          <div className="form-section">
            <h3>2. Refund Method</h3>
            <div className="refund-methods">
              <label className="refund-method-option">
                <input
                  type="radio"
                  value="Original Payment Method"
                  checked={refundMethod === "Original Payment Method"}
                  onChange={(e) => setRefundMethod(e.target.value)}
                />
                <span>Original Payment Method</span>
              </label>
              <label className="refund-method-option">
                <input
                  type="radio"
                  value="Bank Transfer"
                  checked={refundMethod === "Bank Transfer"}
                  onChange={(e) => setRefundMethod(e.target.value)}
                />
                <span>Bank Transfer</span>
              </label>
            </div>

            {refundMethod === "Bank Transfer" && (
              <div className="bank-details-form">
                <h4>Bank Account Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Account Holder Name *</label>
                    <input
                      type="text"
                      value={bankDetails.accountHolderName}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          accountHolderName: e.target.value,
                        })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number *</label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          accountNumber: e.target.value,
                        })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>IFSC Code *</label>
                    <input
                      type="text"
                      value={bankDetails.ifscCode}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          ifscCode: e.target.value.toUpperCase(),
                        })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bank Name *</label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          bankName: e.target.value,
                        })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refund Summary */}
          {selectedItems.length > 0 && (
            <div className="refund-summary">
              <h3>Refund Summary</h3>
              <div className="summary-row">
                <span>Items Selected:</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="summary-row total">
                <span>Total Refund Amount:</span>
                <span>{formatPrice(calculateRefundAmount())}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/my-orders")}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequest;
