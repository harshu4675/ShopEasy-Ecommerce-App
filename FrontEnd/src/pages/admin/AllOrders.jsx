import React, { useState, useEffect } from "react";
import { api, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(response.data);
    } catch (error) {
      showToast("Error fetching orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { orderStatus });
      showToast("Order status updated", "success");
      fetchOrders();
    } catch (error) {
      showToast("Error updating order", "error");
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { paymentStatus });
      showToast("Payment status updated", "success");
      fetchOrders();
    } catch (error) {
      showToast("Error updating payment", "error");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderStatus.toLowerCase().replace(" ", "-") === filter;
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
            "delivered",
            "cancelled",
          ].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
          </div>
        ) : (
          <div className="orders-admin-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-admin-card">
                <div className="order-admin-header">
                  <div className="order-basic-info">
                    <h3>Order #{order.orderId || order._id.slice(-8)}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
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
                  <p>📱 {order.shippingAddress.phone}</p>
                </div>

                <div className="order-shipping">
                  <p>
                    <strong>📍 Shipping Address:</strong>
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    - {order.shippingAddress.pincode}
                  </p>
                </div>

                <div className="order-items-preview">
                  {order.items.map((item, index) => (
                    <div key={index} className="item-mini">
                      <img src={item.image} alt={item.name} />
                      <span className="item-qty-badge">{item.quantity}</span>
                    </div>
                  ))}
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
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
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
        )}
      </div>
    </div>
  );
};

export default AllOrders;
