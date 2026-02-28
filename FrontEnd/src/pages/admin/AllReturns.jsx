import React, { useState, useEffect, useCallback } from "react";
import { returnsAPI, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const AllReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedReturn, setExpandedReturn] = useState(null);

  const fetchReturns = useCallback(async () => {
    try {
      const response = await returnsAPI.getAll();
      setReturns(response.data);
    } catch (error) {
      console.error("Fetch returns error:", error);
      showToast("Error fetching returns", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const updateReturnStatus = async (
    returnId,
    returnStatus,
    additionalData = {},
  ) => {
    try {
      await returnsAPI.updateStatus(returnId, {
        returnStatus,
        ...additionalData,
      });
      showToast(`Return status updated to ${returnStatus}`, "success");
      fetchReturns();
    } catch (error) {
      console.error("Update return status error:", error);
      showToast(
        error.response?.data?.message || "Error updating return",
        "error",
      );
    }
  };

  const handleStatusChange = (returnId, newStatus) => {
    // If rejecting, ask for reason
    if (newStatus === "Rejected") {
      const reason = prompt("Please enter rejection reason:");
      if (!reason) return;
      updateReturnStatus(returnId, newStatus, { rejectionReason: reason });
    } else {
      updateReturnStatus(returnId, newStatus);
    }
  };

  const addAdminNotes = (returnId) => {
    const notes = prompt("Enter admin notes:");
    if (!notes) return;
    updateReturnStatus(
      returnId,
      returns.find((r) => r._id === returnId).returnStatus,
      {
        adminNotes: notes,
      },
    );
  };

  const filteredReturns = returns.filter((returnReq) => {
    if (filter === "all") return true;
    return returnReq.returnStatus.toLowerCase().replace(/\s+/g, "-") === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <h1>All Returns & Refunds ({returns.length})</h1>
        </div>

        <div className="filter-tabs">
          {[
            "all",
            "pending",
            "approved",
            "rejected",
            "pickup-scheduled",
            "item-received",
            "refund-processing",
            "refund-completed",
          ].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </button>
          ))}
        </div>

        {filteredReturns.length === 0 ? (
          <div className="empty-state">
            <h3>No returns found</h3>
            <p>No return requests match the selected filter</p>
          </div>
        ) : (
          <div className="returns-admin-list">
            {filteredReturns.map((returnReq) => (
              <div key={returnReq._id} className="return-admin-card">
                <div
                  className="return-admin-header"
                  onClick={() =>
                    setExpandedReturn(
                      expandedReturn === returnReq._id ? null : returnReq._id,
                    )
                  }
                >
                  <div className="return-basic-info">
                    <h3>Return #{returnReq.returnId}</h3>
                    <p className="return-date">
                      {formatDate(returnReq.createdAt)}
                    </p>
                    <span
                      className="return-status-badge"
                      style={{
                        backgroundColor: getStatusColor(returnReq.returnStatus),
                      }}
                    >
                      {returnReq.returnStatus}
                    </span>
                  </div>
                  <div className="return-amount">
                    <span className="amount">
                      Refund: {formatPrice(returnReq.refundAmount)}
                    </span>
                    <p className="order-ref">
                      Order: #{returnReq.order?.orderId || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="return-customer">
                  <p>
                    <strong>👤 {returnReq.user?.name || "N/A"}</strong>
                  </p>
                  <p>📧 {returnReq.user?.email || "N/A"}</p>
                  <p>📱 {returnReq.pickupAddress?.phone || "N/A"}</p>
                </div>

                <div className="return-reason-preview">
                  <p>
                    <strong>Reason:</strong> {returnReq.returnReason}
                  </p>
                  {returnReq.additionalComments && (
                    <p className="comments">{returnReq.additionalComments}</p>
                  )}
                </div>

                <div className="return-items-preview">
                  {returnReq.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="item-mini">
                      <img src={item.image} alt={item.name} />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                  ))}
                  {returnReq.items.length > 4 && (
                    <div className="item-mini more-items">
                      +{returnReq.items.length - 4}
                    </div>
                  )}
                </div>

                {expandedReturn === returnReq._id && (
                  <div className="return-expanded-details">
                    <div className="return-items-full">
                      <h4>Return Items</h4>
                      {returnReq.items.map((item, index) => (
                        <div key={index} className="return-item-detail">
                          <img src={item.image} alt={item.name} />
                          <div className="item-info">
                            <p className="item-name">{item.name}</p>
                            <p className="item-options">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && " | "}
                              {item.color && `Color: ${item.color}`}
                            </p>
                            <p className="item-qty">Qty: {item.quantity}</p>
                            <p className="item-reason-detail">
                              <strong>Reason:</strong> {item.reason}
                            </p>
                          </div>
                          <p className="item-price">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="return-details-grid">
                      <div className="pickup-address">
                        <h4>📍 Pickup Address</h4>
                        <p>{returnReq.pickupAddress?.fullName}</p>
                        <p>{returnReq.pickupAddress?.address}</p>
                        <p>
                          {returnReq.pickupAddress?.city},{" "}
                          {returnReq.pickupAddress?.state} -{" "}
                          {returnReq.pickupAddress?.pincode}
                        </p>
                        <p>Phone: {returnReq.pickupAddress?.phone}</p>
                      </div>

                      <div className="refund-method">
                        <h4>💳 Refund Method</h4>
                        <p>{returnReq.refundMethod}</p>
                        {returnReq.bankDetails && (
                          <div className="bank-details">
                            <p>
                              <strong>A/C Holder:</strong>{" "}
                              {returnReq.bankDetails.accountHolderName}
                            </p>
                            <p>
                              <strong>A/C No:</strong>{" "}
                              {returnReq.bankDetails.accountNumber}
                            </p>
                            <p>
                              <strong>IFSC:</strong>{" "}
                              {returnReq.bankDetails.ifscCode}
                            </p>
                            <p>
                              <strong>Bank:</strong>{" "}
                              {returnReq.bankDetails.bankName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {returnReq.adminNotes && (
                      <div className="admin-notes-display">
                        <h4>📝 Admin Notes</h4>
                        <p>{returnReq.adminNotes}</p>
                      </div>
                    )}

                    {returnReq.rejectionReason && (
                      <div className="rejection-reason-display">
                        <h4>❌ Rejection Reason</h4>
                        <p>{returnReq.rejectionReason}</p>
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
                                <p className="timeline-status">
                                  {update.status}
                                </p>
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
                  </div>
                )}

                <div className="return-status-controls">
                  <div className="status-control">
                    <label>Return Status:</label>
                    <select
                      value={returnReq.returnStatus}
                      onChange={(e) =>
                        handleStatusChange(returnReq._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Pickup Scheduled">Pickup Scheduled</option>
                      <option value="Item Received">Item Received</option>
                      <option value="Refund Processing">
                        Refund Processing
                      </option>
                      <option value="Refund Completed">Refund Completed</option>
                    </select>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => addAdminNotes(returnReq._id)}
                  >
                    Add Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReturns;
