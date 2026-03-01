import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import Loader from "../components/Loader";
import RefundBankModal from "../components/RefundBankModal"; // ✅ NEW
import "../styles/MyOrders.css";

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null); // ✅ NEW
  const [showRefundModal, setShowRefundModal] = useState(false); // ✅ NEW
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null); // ✅ NEW

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      showToast("Error fetching orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Cancel order with refund check
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingId(orderId);
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);

      // ✅ Check if order was paid and needs bank details
      if (response.data.requiresBankDetails) {
        setSelectedOrderForRefund(response.data.order);
        setShowRefundModal(true);
        showToast(
          "Order cancelled. Please submit bank details for refund.",
          "info",
        );
      } else {
        showToast("Order cancelled successfully", "success");
      }

      fetchOrders();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error cancelling order",
        "error",
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ✅ NEW: Handle refund success
  const handleRefundSuccess = (updatedOrder) => {
    setOrders(
      orders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
    );
    setShowRefundModal(false);
    setSelectedOrderForRefund(null);
    fetchOrders(); // Refresh orders
  };

  // ✅ NEW: Check if order needs bank details for refund
  const needsRefundDetails = (order) => {
    return (
      order.orderStatus === "Cancelled" &&
      order.paymentStatus === "Paid" &&
      !order.refundDetails?.bankDetails
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      Placed: "status-placed",
      Confirmed: "status-confirmed",
      Processing: "status-processing",
      Shipped: "status-shipped",
      "Out for Delivery": "status-shipped",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled",
      Returned: "status-cancelled",
    };
    return colors[status] || "status-placed";
  };

  // ✅ NEW: Get payment status color
  const getPaymentStatusColor = (status) => {
    const colors = {
      Pending: "payment-pending",
      Paid: "payment-paid",
      Failed: "payment-failed",
      "Refund Requested": "payment-refund-requested",
      Refunded: "payment-refunded",
    };
    return colors[status] || "payment-pending";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const canReturn = (order) => {
    if (order.orderStatus !== "Delivered")
      return { allowed: false, reason: "Order not delivered" };

    const deliveryDate = new Date(order.deliveredAt || order.updatedAt);
    const today = new Date();
    const daysSinceDelivery = Math.floor(
      (today - deliveryDate) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceDelivery > 7) {
      return {
        allowed: false,
        reason: `Return window expired (${daysSinceDelivery} days since delivery)`,
      };
    }

    return {
      allowed: true,
      daysLeft: 7 - daysSinceDelivery,
    };
  };

  const initiateReturn = (order) => {
    const returnCheck = canReturn(order);

    if (!returnCheck.allowed) {
      showToast(returnCheck.reason, "error");
      return;
    }

    navigate("/return-request", { state: { order } });
  };

  if (loading) return <Loader fullScreen />;

  if (orders.length === 0) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">📦</span>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders. Start shopping now!</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="container">
        <h1>My Orders</h1>
        <p className="orders-count">{orders.length} orders placed</p>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div
                className="order-header"
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order._id ? null : order._id,
                  )
                }
              >
                <div className="order-info">
                  <div className="order-id">
                    <span>Order #{order.orderId}</span>
                    <span
                      className={`order-status ${getStatusColor(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="order-date">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="order-summary-right">
                  <p className="order-total">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <span className="expand-icon">
                    {expandedOrder === order._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="item-preview">
                    <img src={item.image} alt={item.name} />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="more-items">+{order.items.length - 3}</div>
                )}
              </div>

              {/* ✅ NEW: Show refund status banner */}
              {order.paymentStatus === "Refund Requested" && (
                <div className="refund-banner refund-processing">
                  ⏳ Refund of {formatPrice(order.totalAmount)} is being
                  processed
                </div>
              )}
              {order.paymentStatus === "Refunded" && (
                <div className="refund-banner refund-completed">
                  ✅ Refund of {formatPrice(order.totalAmount)} has been
                  processed
                  {order.refundDetails?.refundTransactionId && (
                    <span className="refund-txn">
                      | Txn ID: {order.refundDetails.refundTransactionId}
                    </span>
                  )}
                </div>
              )}

              {/* ✅ NEW: Show "Submit Bank Details" button if needed */}
              {needsRefundDetails(order) && (
                <div className="refund-action-banner">
                  <span>
                    💰 Your order was paid. Submit bank details to receive
                    refund.
                  </span>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrderForRefund(order);
                      setShowRefundModal(true);
                    }}
                  >
                    Submit Bank Details
                  </button>
                </div>
              )}

              {expandedOrder === order._id && (
                <div className="order-details">
                  <div className="order-items-full">
                    <h4>Items in this order</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.image} alt={item.name} />
                        <div className="item-info">
                          <p className="item-name">{item.name}</p>
                          <p className="item-options">
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

                  <div className="order-meta">
                    <div className="shipping-address">
                      <h4>📍 Shipping Address</h4>
                      <p>{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} -{" "}
                        {order.shippingAddress.pincode}
                      </p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                    </div>

                    <div className="payment-info">
                      <h4>💳 Payment</h4>
                      <p>Method: {order.paymentMethod}</p>
                      <p>
                        Status:{" "}
                        <span
                          className={`payment-status ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </p>
                      {/* ✅ Show Razorpay Payment ID if exists */}
                      {order.razorpayPaymentId && (
                        <p className="razorpay-id">
                          Payment ID: {order.razorpayPaymentId}
                        </p>
                      )}
                    </div>

                    {order.expectedDelivery &&
                      order.orderStatus !== "Delivered" &&
                      order.orderStatus !== "Cancelled" && (
                        <div className="expected-delivery">
                          <h4>🚚 Expected Delivery</h4>
                          <p>{formatDate(order.expectedDelivery)}</p>
                        </div>
                      )}

                    {/* ✅ NEW: Show refund details if applicable */}
                    {order.refundDetails?.bankDetails && (
                      <div className="refund-details-section">
                        <h4>🏦 Refund Details</h4>
                        <p>
                          Amount:{" "}
                          {formatPrice(order.refundDetails.refundAmount)}
                        </p>
                        <p>Status: {order.paymentStatus}</p>
                        {order.refundDetails.refundCompletedAt && (
                          <p>
                            Processed on:{" "}
                            {formatDate(order.refundDetails.refundCompletedAt)}
                          </p>
                        )}
                        {order.refundDetails.refundTransactionId && (
                          <p>
                            Transaction ID:{" "}
                            {order.refundDetails.refundTransactionId}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {order.deliveryUpdates &&
                    order.deliveryUpdates.length > 0 && (
                      <div className="delivery-timeline">
                        <h4>📋 Order Timeline</h4>
                        <div className="timeline">
                          {order.deliveryUpdates.map((update, index) => (
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

                  <div className="order-price-breakdown">
                    <div className="price-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="price-row discount">
                        <span>Discount</span>
                        <span>-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="price-row">
                      <span>Delivery</span>
                      <span>
                        {order.deliveryCharge === 0
                          ? "FREE"
                          : formatPrice(order.deliveryCharge)}
                      </span>
                    </div>
                    <div className="price-row total">
                      <span>Total</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="order-actions">
                    {/* Cancel Button - Only for pending orders */}
                    {["Placed", "Confirmed", "Processing"].includes(
                      order.orderStatus,
                    ) && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="btn btn-danger"
                        disabled={cancellingId === order._id}
                      >
                        {cancellingId === order._id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}

                    {/* ✅ NEW: Submit Bank Details Button */}
                    {needsRefundDetails(order) && (
                      <button
                        onClick={() => {
                          setSelectedOrderForRefund(order);
                          setShowRefundModal(true);
                        }}
                        className="btn btn-warning"
                      >
                        🏦 Submit Bank Details for Refund
                      </button>
                    )}

                    {/* Return Button */}
                    {order.orderStatus === "Delivered" &&
                      order.paymentStatus !== "Refunded" &&
                      (() => {
                        const returnCheck = canReturn(order);
                        return returnCheck.allowed ? (
                          <div className="return-action">
                            <button
                              onClick={() => initiateReturn(order)}
                              className="btn btn-warning"
                            >
                              Request Return
                            </button>
                            <span className="return-days-left">
                              {returnCheck.daysLeft} days left to return
                            </span>
                          </div>
                        ) : (
                          <div className="return-expired">
                            <span className="btn btn-disabled" disabled>
                              Return Window Closed
                            </span>
                            <span className="return-expired-msg">
                              Returns allowed within 7 days of delivery only
                            </span>
                          </div>
                        );
                      })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ NEW: Refund Bank Details Modal */}
      {showRefundModal && selectedOrderForRefund && (
        <RefundBankModal
          order={selectedOrderForRefund}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedOrderForRefund(null);
          }}
          onSuccess={handleRefundSuccess}
        />
      )}
    </div>
  );
};

export default MyOrders;
