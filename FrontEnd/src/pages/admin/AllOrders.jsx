import React, { useState, useEffect, useCallback } from "react";
import { api, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      // ✅ FIX: Correct endpoint
      const response = await api.get("/orders/admin/all");
      setOrders(response.data);
    } catch (error) {
      console.error("Fetch orders error:", error);
      showToast("Error fetching orders", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      // ✅ FIX: Correct endpoint
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      showToast(`Order status updated to ${orderStatus}`, "success");
      fetchOrders();
    } catch (error) {
      console.error("Update order status error:", error);
      showToast(
        error.response?.data?.message || "Error updating order",
        "error",
      );
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      // ✅ FIX: Correct endpoint (was using wrong one)
      await api.put(`/orders/${orderId}/payment-status`, { paymentStatus });
      showToast(`Payment status updated to ${paymentStatus}`, "success");
      fetchOrders();
    } catch (error) {
      console.error("Update payment status error:", error);
      showToast(
        error.response?.data?.message || "Error updating payment",
        "error",
      );
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderStatus.toLowerCase().replace(/\s+/g, "-") === filter;
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
      Placed: "#f59e0b",
      Confirmed: "#3b82f6",
      Processing: "#8b5cf6",
      Shipped: "#06b6d4",
      "Out for Delivery": "#10b981",
      Delivered: "#22c55e",
      Cancelled: "#ef4444",
      Returned: "#f97316",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <h1>All Orders ({orders.length})</h1>
        </div>

        <div className="filter-tabs">
          {[
            "all",
            "placed",
            "confirmed",
            "processing",
            "shipped",
            "out-for-delivery",
            "delivered",
            "cancelled",
            "Returned",
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

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>No orders match the selected filter</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="orders-desktop-table">
              <div className="orders-admin-list">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="order-admin-card">
                    <div className="order-admin-header">
                      <div className="order-basic-info">
                        <h3>Order #{order.orderId || order._id.slice(-8)}</h3>
                        <p className="order-date">
                          {formatDate(order.createdAt)}
                        </p>
                        <span
                          className="order-status-badge"
                          style={{
                            backgroundColor: getStatusColor(order.orderStatus),
                          }}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="order-amount">
                        <span className="amount">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <span
                          className={`payment-badge ${order.paymentStatus.toLowerCase()}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="order-customer">
                      <p>
                        <strong>👤 {order.user?.name || "N/A"}</strong>
                      </p>
                      <p>📧 {order.user?.email || "N/A"}</p>
                      <p>📱 {order.shippingAddress?.phone || "N/A"}</p>
                    </div>

                    <div className="order-shipping">
                      <p>
                        <strong>📍 Shipping Address:</strong>
                      </p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state} -{" "}
                        {order.shippingAddress?.pincode}
                      </p>
                    </div>

                    <div className="order-items-preview">
                      {order.items.slice(0, 4).map((item, index) => (
                        <div key={index} className="item-mini">
                          <img src={item.image} alt={item.name} />
                          <span className="item-qty-badge">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="item-mini more-items">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="order-status-controls">
                      <div className="status-control">
                        <label>Order Status:</label>
                        <select
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
                      </div>

                      <div className="status-control">
                        <label>Payment Status:</label>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            updatePaymentStatus(order._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="orders-mobile-grid">
              {filteredOrders.map((order) => (
                <div key={order._id} className="order-mobile-card">
                  <div className="order-mobile-header">
                    <div className="order-mobile-id">
                      <h4>#{order.orderId || order._id.slice(-8)}</h4>
                      <span className="order-mobile-date">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <span
                      className="order-status-badge-mobile"
                      style={{
                        backgroundColor: getStatusColor(order.orderStatus),
                      }}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="order-mobile-customer">
                    <p>
                      <strong>{order.user?.name || "N/A"}</strong>
                    </p>
                    <p>{order.shippingAddress?.phone}</p>
                  </div>

                  <div className="order-mobile-amount">
                    <span className="amount">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <span
                      className={`payment-badge ${order.paymentStatus.toLowerCase()}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="order-mobile-items">
                    {order.items.slice(0, 3).map((item, index) => (
                      <img key={index} src={item.image} alt={item.name} />
                    ))}
                    {order.items.length > 3 && (
                      <span className="more-items">
                        +{order.items.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="order-mobile-controls">
                    <div className="control-group">
                      <label>Order:</label>
                      <select
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
                    </div>

                    <div className="control-group">
                      <label>Payment:</label>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          updatePaymentStatus(order._id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
