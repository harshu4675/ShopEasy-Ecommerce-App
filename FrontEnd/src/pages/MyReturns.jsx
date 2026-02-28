import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { returnsAPI, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import Loader from "../components/Loader";
import "../styles/Returns.css";

const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReturn, setExpandedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await returnsAPI.getMyReturns();
      setReturns(response.data);
    } catch (error) {
      showToast("Error fetching returns", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelReturn = async (returnId) => {
    if (!window.confirm("Are you sure you want to cancel this return request?"))
      return;

    try {
      await returnsAPI.cancel(returnId);
      showToast("Return request cancelled", "success");
      fetchReturns();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error cancelling return",
        "error",
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "#f59e0b",
      Approved: "#3b82f6",
      Rejected: "#ef4444",
      "Pickup Scheduled": "#8b5cf6",
      "Item Received": "#06b6d4",
      "Refund Processing": "#10b981",
      "Refund Completed": "#22c55e",
    };
    return colors[status] || "#6b7280";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <Loader fullScreen />;

  if (returns.length === 0) {
    return (
      <div className="my-returns-page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">🔄</span>
            <h2>No return requests</h2>
            <p>You haven't made any return requests yet.</p>
            <Link to="/my-orders" className="btn btn-primary btn-lg">
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-returns-page">
      <div className="container">
        <h1>My Returns & Refunds</h1>
        <p className="returns-count">{returns.length} return requests</p>

        <div className="returns-list">
          {returns.map((returnReq) => (
            <div key={returnReq._id} className="return-card">
              <div
                className="return-header"
                onClick={() =>
                  setExpandedReturn(
                    expandedReturn === returnReq._id ? null : returnReq._id,
                  )
                }
              >
                <div className="return-info">
                  <div className="return-id">
                    <span>Return #{returnReq.returnId}</span>
                    <span
                      className="return-status"
                      style={{
                        backgroundColor: getStatusColor(returnReq.returnStatus),
                      }}
                    >
                      {returnReq.returnStatus}
                    </span>
                  </div>
                  <p className="return-date">
                    Requested on {formatDate(returnReq.createdAt)}
                  </p>
                  <p className="order-ref">
                    Order: #{returnReq.order?.orderId || "N/A"}
                  </p>
                </div>
                <div className="return-summary-right">
                  <p className="refund-amount">
                    Refund: {formatPrice(returnReq.refundAmount)}
                  </p>
                  <span className="expand-icon">
                    {expandedReturn === returnReq._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expandedReturn === returnReq._id && (
                <div className="return-details">
                  <div className="return-items">
                    <h4>Return Items</h4>
                    {returnReq.items.map((item, index) => (
                      <div key={index} className="return-item">
                        <img src={item.image} alt={item.name} />
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-options">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " | "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                          <p className="item-qty">Qty: {item.quantity}</p>
                          <p className="item-reason">
                            <strong>Reason:</strong> {item.reason}
                          </p>
                        </div>
                        <p className="item-price">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="return-meta">
                    <div className="return-reason">
                      <h4>Return Reason</h4>
                      <p>{returnReq.returnReason}</p>
                      {returnReq.additionalComments && (
                        <p className="additional-comments">
                          <strong>Additional Comments:</strong>{" "}
                          {returnReq.additionalComments}
                        </p>
                      )}
                    </div>

                    <div className="refund-info">
                      <h4>Refund Information</h4>
                      <p>Method: {returnReq.refundMethod}</p>
                      <p>Amount: {formatPrice(returnReq.refundAmount)}</p>
                      {returnReq.bankDetails && (
                        <div className="bank-details">
                          <p>
                            <strong>Account Holder:</strong>{" "}
                            {returnReq.bankDetails.accountHolderName}
                          </p>
                          <p>
                            <strong>Account No:</strong>{" "}
                            {returnReq.bankDetails.accountNumber}
                          </p>
                          <p>
                            <strong>IFSC:</strong>{" "}
                            {returnReq.bankDetails.ifscCode}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {returnReq.rejectionReason && (
                    <div className="rejection-reason">
                      <h4>❌ Rejection Reason</h4>
                      <p>{returnReq.rejectionReason}</p>
                    </div>
                  )}

                  {returnReq.adminNotes && (
                    <div className="admin-notes">
                      <h4>📝 Admin Notes</h4>
                      <p>{returnReq.adminNotes}</p>
                    </div>
                  )}

                  {returnReq.timeline && returnReq.timeline.length > 0 && (
                    <div className="return-timeline">
                      <h4>📋 Return Timeline</h4>
                      <div className="timeline">
                        {returnReq.timeline.map((update, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <p className="timeline-status">{update.status}</p>
                              {update.description && (
                                <p className="timeline-desc">
                                  {update.description}
                                </p>
                              )}
                              <p className="timeline-time">
                                {formatDate(update.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {returnReq.returnStatus === "Pending" && (
                    <div className="return-actions">
                      <button
                        onClick={() => cancelReturn(returnReq._id)}
                        className="btn btn-danger"
                      >
                        Cancel Return Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyReturns;
