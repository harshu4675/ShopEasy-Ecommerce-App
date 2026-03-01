import React, { useState, useEffect } from "react";
import { api, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";
import "../../styles/AdminPages.css";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPayment, searchTerm]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPayment !== "all")
        params.append("paymentStatus", filterPayment);
      if (searchTerm) params.append("search", searchTerm);

      const response = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(response.data);
    } catch (error) {
      showToast("Error fetching orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      showToast("Order status updated successfully", "success");
      fetchOrders();
    } catch (error) {
      showToast("Error updating order status", "error");
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/payment-status`, {
        paymentStatus: newStatus,
      });
      showToast("Payment status updated successfully", "success");
      fetchOrders();
    } catch (error) {
      showToast("Error updating payment status", "error");
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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

  const getPaymentStatusBadge = (status) => {
    const badges = {
      Pending: "badge-warning",
      Paid: "badge-success",
      Failed: "badge-danger",
      "Refund Requested": "badge-info",
      Refunded: "badge-purple",
    };
    return badges[status] || "badge-secondary";
  };

  const getOrderStatusBadge = (status) => {
    const badges = {
      Placed: "badge-info",
      Confirmed: "badge-primary",
      Processing: "badge-warning",
      Shipped: "badge-info",
      "Out for Delivery": "badge-info",
      Delivered: "badge-success",
      Cancelled: "badge-danger",
      Returned: "badge-danger",
    };
    return badges[status] || "badge-secondary";
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>All Orders</h1>
          <p>{orders.length} total orders</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Order Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Payment Status</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refund Requested">Refund Requested</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by Order ID, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{order.orderId}</strong>
                      {/* ✅ Show Razorpay ID if exists */}
                      {order.razorpayPaymentId && (
                        <div className="razorpay-id-small">
                          <small>
                            💳 {order.razorpayPaymentId.slice(0, 15)}...
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="customer-info">
                        <strong>{order.user?.name || "N/A"}</strong>
                        <small>{order.user?.email || "N/A"}</small>
                        <small>{order.shippingAddress?.phone}</small>
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>
                      <strong>{formatPrice(order.totalAmount)}</strong>
                    </td>
                    <td>
                      <span className="payment-method-badge">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`status-select ${getPaymentStatusBadge(order.paymentStatus)}`}
                        value={order.paymentStatus}
                        onChange={(e) =>
                          updatePaymentStatus(order._id, e.target.value)
                        }
                        disabled={order.paymentStatus === "Refunded"}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refund Requested">
                          Refund Requested
                        </option>
                        <option value="Refunded">Refunded</option>
                      </select>
                      {/* ✅ Show refund indicator */}
                      {order.paymentStatus === "Refund Requested" && (
                        <div className="refund-indicator">
                          <small>⚠️ Bank details submitted</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <select
                        className={`status-select ${getOrderStatusBadge(order.orderStatus)}`}
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => viewOrderDetails(order)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.orderId}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Order Status Section */}
              <div className="detail-section">
                <h3>📦 Order Status</h3>
                <div className="status-badges">
                  <span
                    className={`badge ${getOrderStatusBadge(selectedOrder.orderStatus)}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                  <span
                    className={`badge ${getPaymentStatusBadge(selectedOrder.paymentStatus)}`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <p>
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </p>
                {selectedOrder.razorpayPaymentId && (
                  <p>
                    <strong>Razorpay Payment ID:</strong>{" "}
                    {selectedOrder.razorpayPaymentId}
                  </p>
                )}
                {selectedOrder.razorpayOrderId && (
                  <p>
                    <strong>Razorpay Order ID:</strong>{" "}
                    {selectedOrder.razorpayOrderId}
                  </p>
                )}
                <p>
                  <strong>Order Date:</strong>{" "}
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              {/* ✅ NEW: Refund Bank Details Section */}
              {selectedOrder.refundDetails?.bankDetails && (
                <div className="detail-section refund-bank-section">
                  <h3>🏦 Refund Bank Details</h3>
                  <div className="bank-details-grid">
                    <div className="bank-detail">
                      <span className="label">Account Holder Name:</span>
                      <span className="value">
                        {
                          selectedOrder.refundDetails.bankDetails
                            .accountHolderName
                        }
                      </span>
                    </div>
                    <div className="bank-detail">
                      <span className="label">Account Number:</span>
                      <span className="value">
                        {selectedOrder.refundDetails.bankDetails.accountNumber}
                      </span>
                    </div>
                    <div className="bank-detail">
                      <span className="label">IFSC Code:</span>
                      <span className="value">
                        {selectedOrder.refundDetails.bankDetails.ifscCode}
                      </span>
                    </div>
                    {selectedOrder.refundDetails.bankDetails.bankName && (
                      <div className="bank-detail">
                        <span className="label">Bank Name:</span>
                        <span className="value">
                          {selectedOrder.refundDetails.bankDetails.bankName}
                        </span>
                      </div>
                    )}
                    {selectedOrder.refundDetails.bankDetails.upiId && (
                      <div className="bank-detail">
                        <span className="label">UPI ID:</span>
                        <span className="value">
                          {selectedOrder.refundDetails.bankDetails.upiId}
                        </span>
                      </div>
                    )}
                    <div className="bank-detail">
                      <span className="label">Refund Amount:</span>
                      <span className="value refund-amount">
                        {formatPrice(selectedOrder.refundDetails.refundAmount)}
                      </span>
                    </div>
                    <div className="bank-detail">
                      <span className="label">Requested On:</span>
                      <span className="value">
                        {formatDate(
                          selectedOrder.refundDetails.refundInitiatedAt,
                        )}
                      </span>
                    </div>
                    {selectedOrder.refundDetails.refundCompletedAt && (
                      <div className="bank-detail">
                        <span className="label">Refund Completed:</span>
                        <span className="value">
                          {formatDate(
                            selectedOrder.refundDetails.refundCompletedAt,
                          )}
                        </span>
                      </div>
                    )}
                    {selectedOrder.refundDetails.refundTransactionId && (
                      <div className="bank-detail">
                        <span className="label">Transaction ID:</span>
                        <span className="value">
                          {selectedOrder.refundDetails.refundTransactionId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ✅ Quick action to process refund */}
                  {selectedOrder.paymentStatus === "Refund Requested" && (
                    <div className="refund-action">
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          window.location.href = `/admin/refunds`;
                        }}
                      >
                        Go to Refund Management
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Details */}
              <div className="detail-section">
                <h3>👤 Customer Details</h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.user?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.user?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.user?.phone || "N/A"}
                </p>
              </div>

              {/* Shipping Address */}
              <div className="detail-section">
                <h3>📍 Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.address}</p>
                <p>
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state} -{" "}
                  {selectedOrder.shippingAddress.pincode}
                </p>
                <p>Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>

              {/* Order Items */}
              <div className="detail-section">
                <h3>📦 Order Items</h3>
                <div className="order-items">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-details">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " | "}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="item-price">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="detail-section">
                <h3>💰 Price Breakdown</h3>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="price-row discount">
                      <span>Discount:</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="price-row">
                    <span>Delivery:</span>
                    <span>
                      {selectedOrder.deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(selectedOrder.deliveryCharge)}
                    </span>
                  </div>
                  <div className="price-row total">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Timeline */}
              {selectedOrder.deliveryUpdates &&
                selectedOrder.deliveryUpdates.length > 0 && (
                  <div className="detail-section">
                    <h3>🚚 Delivery Timeline</h3>
                    <div className="timeline">
                      {selectedOrder.deliveryUpdates.map((update, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <p className="timeline-status">{update.status}</p>
                            {update.description && (
                              <p className="timeline-desc">
                                {update.description}
                              </p>
                            )}
                            {update.location && (
                              <p className="timeline-location">
                                📍 {update.location}
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

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
