import React, { useState } from "react";
import { api, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import "../styles/RefundBankModal.css";

const RefundBankModal = ({ order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifscCode" ? value.toUpperCase() : value,
    }));
  };

  const validateForm = () => {
    if (!formData.accountHolderName.trim()) {
      showToast("Please enter account holder name", "error");
      return false;
    }
    if (!formData.accountNumber.trim()) {
      showToast("Please enter account number", "error");
      return false;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      showToast("Account numbers do not match", "error");
      return false;
    }
    if (!formData.ifscCode.trim()) {
      showToast("Please enter IFSC code", "error");
      return false;
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifscCode)) {
      showToast("Invalid IFSC code format", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post(
        `/orders/${order._id}/refund-bank-details`,
        formData,
      );
      showToast(
        response.data.message || "Refund request submitted successfully! 🎉",
        "success",
      );
      onSuccess(response.data.order);
      onClose();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to submit refund request",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏦 Bank Details for Refund</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="refund-info">
          <p>
            Order ID: <strong>#{order.orderId}</strong>
          </p>
          <p>
            Refund Amount:{" "}
            <strong className="refund-amount">
              {formatPrice(order.totalAmount)}
            </strong>
          </p>
          <p className="refund-note">
            💡 Your refund will be processed within 5-7 business days after
            verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="refund-form">
          <div className="form-group">
            <label>Account Holder Name *</label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Enter name as per bank account"
              required
            />
          </div>

          <div className="form-group">
            <label>Account Number *</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter your account number"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Account Number *</label>
            <input
              type="text"
              name="confirmAccountNumber"
              value={formData.confirmAccountNumber}
              onChange={handleChange}
              placeholder="Re-enter your account number"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>IFSC Code *</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g., SBIN0001234"
                maxLength="11"
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g., State Bank of India"
              />
            </div>
          </div>

          <div className="form-group">
            <label>UPI ID (Optional)</label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleChange}
              placeholder="e.g., yourname@upi"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Refund Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundBankModal;
