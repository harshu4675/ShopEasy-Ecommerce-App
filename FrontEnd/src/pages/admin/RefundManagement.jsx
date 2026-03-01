import React, { useState, useEffect } from "react";
import { api, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";
import "../../styles/RefundManagement.css";

const RefundManagement = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundForm, setRefundForm] = useState({
    refundTransactionId: "",
    refundNotes: "",
  });

  useEffect(() => {
    fetchRefundRequests();
  }, [filter]);

  const fetchRefundRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/orders/admin/refund-requests?status=${filter}`,
      );
      setRefundRequests(response.data);
    } catch (error) {
      showToast("Error fetching refund requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (orderId) => {
    if (
      !window.confirm("Are you sure you want to mark this refund as processed?")
    )
      return;

    setProcessingId(orderId);
    try {
      const response = await api.put(
        `/orders/${orderId}/process-refund`,
        refundForm,
      );
      showToast("Refund processed successfully! ✓", "success");
      setSelectedRefund(null);
      setRefundForm({ refundTransactionId: "", refundNotes: "" });
      fetchRefundRequests();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error processing refund",
        "error",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskAccountNumber = (accNo) => {
    if (!accNo || accNo.length < 4) return accNo;
    return "XXXX" + accNo.slice(-4);
  };

  if (loading) return <Loader />;

  return (
    <div className="refund-management">
      <div className="refund-header">
        <h2>🏦 Refund Management</h2>
        <div className="refund-filters">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {refundRequests.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💳</span>
          <h3>No refund requests</h3>
          <p>All refunds have been processed or no requests yet.</p>
        </div>
      ) : (
        <div className="refund-list">
          {refundRequests.map((order) => (
            <div
              key={order._id}
              className={`refund-card ${order.paymentStatus === "Refunded" ? "completed" : "pending"}`}
            >
              <div className="refund-card-header">
                <div className="order-info">
                  <h3>Order #{order.orderId}</h3>
                  <p className="customer-name">
                    👤 {order.user?.name || "N/A"} ({order.user?.email || "N/A"}
                    )
                  </p>
                </div>
                <div className="refund-status">
                  <span
                    className={`status-badge ${order.paymentStatus === "Refunded" ? "badge-success" : "badge-warning"}`}
                  >
                    {order.paymentStatus === "Refunded"
                      ? "✓ Refunded"
                      : "⏳ Pending"}
                  </span>
                </div>
              </div>

              <div className="refund-card-body">
                <div className="refund-amount-section">
                  <span className="label">Refund Amount</span>
                  <span className="amount">
                    {formatPrice(
                      order.refundDetails?.refundAmount || order.totalAmount,
                    )}
                  </span>
                </div>

                <div className="bank-details-section">
                  <h4>🏦 Bank Details</h4>
                  <div className="bank-details-grid">
                    <div className="detail">
                      <span className="label">Account Holder</span>
                      <span className="value">
                        {order.refundDetails?.bankDetails?.accountHolderName}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">Account Number</span>
                      <span className="value">
                        {order.refundDetails?.bankDetails?.accountNumber}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">IFSC Code</span>
                      <span className="value">
                        {order.refundDetails?.bankDetails?.ifscCode}
                      </span>
                    </div>
                    {order.refundDetails?.bankDetails?.bankName && (
                      <div className="detail">
                        <span className="label">Bank Name</span>
                        <span className="value">
                          {order.refundDetails.bankDetails.bankName}
                        </span>
                      </div>
                    )}
                    {order.refundDetails?.bankDetails?.upiId && (
                      <div className="detail">
                        <span className="label">UPI ID</span>
                        <span className="value">
                          {order.refundDetails.bankDetails.upiId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-details-section">
                  <h4>📦 Order Details</h4>
                  <p>
                    Payment Method: <strong>{order.paymentMethod}</strong>
                  </p>
                  {order.razorpayPaymentId && (
                    <p>
                      Razorpay Payment ID:{" "}
                      <strong>{order.razorpayPaymentId}</strong>
                    </p>
                  )}
                  <p>
                    Requested on:{" "}
                    {formatDate(order.refundDetails?.refundInitiatedAt)}
                  </p>
                  {order.refundDetails?.refundCompletedAt && (
                    <p>
                      Processed on:{" "}
                      {formatDate(order.refundDetails.refundCompletedAt)}
                    </p>
                  )}
                  {order.refundDetails?.refundTransactionId && (
                    <p>
                      Refund Transaction ID:{" "}
                      <strong>{order.refundDetails.refundTransactionId}</strong>
                    </p>
                  )}
                </div>
              </div>

              {order.paymentStatus === "Refund Requested" && (
                <div className="refund-card-actions">
                  {selectedRefund === order._id ? (
                    <div className="process-refund-form">
                      <input
                        type="text"
                        placeholder="Refund Transaction ID (optional)"
                        value={refundForm.refundTransactionId}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            refundTransactionId: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={refundForm.refundNotes}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            refundNotes: e.target.value,
                          })
                        }
                      />
                      <div className="form-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedRefund(null);
                            setRefundForm({
                              refundTransactionId: "",
                              refundNotes: "",
                            });
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => processRefund(order._id)}
                          disabled={processingId === order._id}
                        >
                          {processingId === order._id
                            ? "Processing..."
                            : "Confirm Refund"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedRefund(order._id)}
                    >
                      Process Refund
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefundManagement;
