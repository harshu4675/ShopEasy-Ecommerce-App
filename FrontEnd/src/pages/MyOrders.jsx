import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import Loader from "../components/Loader";
import "../styles/MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await api.put(`/orders/${orderId}/cancel`);
      showToast("Order cancelled successfully", "success");
      fetchOrders();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error cancelling order",
        "error",
      );
    }
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
                          className={
                            order.paymentStatus === "Paid" ? "paid" : "pending"
                          }
                        >
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>

                    {order.expectedDelivery &&
                      order.orderStatus !== "Delivered" &&
                      order.orderStatus !== "Cancelled" && (
                        <div className="expected-delivery">
                          <h4>🚚 Expected Delivery</h4>
                          <p>{formatDate(order.expectedDelivery)}</p>
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

                  {["Placed", "Confirmed", "Processing"].includes(
                    order.orderStatus,
                  ) && (
                    <div className="order-actions">
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="btn btn-danger"
                      >
                        Cancel Order
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

export default MyOrders;
