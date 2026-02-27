import React, { useState, useEffect } from "react";
import { api, formatPrice } from "../../utils/api";
import { showToast } from "../../utils/toast";
import Loader from "../../components/Loader";

const DeliveryManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      // Filter orders that need delivery management (not delivered or cancelled)
      const activeOrders = response.data.filter(
        (order) => !["Delivered", "Cancelled"].includes(order.orderStatus),
      );
      setOrders(activeOrders);
    } catch (error) {
      showToast("Error fetching orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({
      ...updateForm,
      [e.target.name]: e.target.value,
    });
  };

  const addDeliveryUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.post(
        `/admin/orders/${selectedOrder._id}/delivery-update`,
        updateForm,
      );
      showToast("Delivery update added successfully! 📦", "success");
      setUpdateForm({ status: "", location: "", description: "" });
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      showToast("Error adding update", "error");
    }
  };

  const quickStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        orderStatus: newStatus,
        description: `Order ${newStatus.toLowerCase()}`,
      });
      showToast(`Order marked as ${newStatus}`, "success");
      fetchOrders();
    } catch (error) {
      showToast("Error updating status", "error");
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

  const getStatusIcon = (status) => {
    const icons = {
      Placed: "📝",
      Confirmed: "✅",
      Processing: "⚙️",
      Shipped: "📦",
      "Out for Delivery": "🚚",
      Delivered: "🎉",
    };
    return icons[status] || "📋";
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <h1>🚚 Delivery Management</h1>
          <p className="page-subtitle">
            {orders.length} active orders to manage
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📦</span>
            <h3>No active deliveries</h3>
            <p>All orders have been delivered or cancelled</p>
          </div>
        ) : (
          <div className="delivery-grid">
            {orders.map((order) => (
              <div key={order._id} className="delivery-card">
                <div className="delivery-card-header">
                  <div>
                    <h3>Order #{order.orderId || order._id.slice(-8)}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`status-badge ${order.orderStatus.toLowerCase().replace(" ", "-")}`}
                  >
                    {getStatusIcon(order.orderStatus)} {order.orderStatus}
                  </span>
                </div>

                <div className="delivery-customer">
                  <p>
                    <strong>{order.shippingAddress.fullName}</strong>
                  </p>
                  <p>📱 {order.shippingAddress.phone}</p>
                  <p>
                    📍 {order.shippingAddress.address},{" "}
                    {order.shippingAddress.city}
                  </p>
                  <p>
                    {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                </div>

                <div className="delivery-items">
                  <p>
                    <strong>{order.items.length} items</strong> •{" "}
                    {formatPrice(order.totalAmount)}
                  </p>
                  <div className="items-mini-preview">
                    {order.items.slice(0, 4).map((item, index) => (
                      <img key={index} src={item.image} alt={item.name} />
                    ))}
                    {order.items.length > 4 && (
                      <span className="more-count">
                        +{order.items.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {order.expectedDelivery && (
                  <div className="expected-delivery">
                    <span>
                      📅 Expected: {formatDate(order.expectedDelivery)}
                    </span>
                  </div>
                )}

                {/* Timeline */}
                {order.deliveryUpdates && order.deliveryUpdates.length > 0 && (
                  <div className="delivery-timeline-mini">
                    <p className="timeline-title">Recent Updates:</p>
                    {order.deliveryUpdates
                      .slice(-3)
                      .reverse()
                      .map((update, index) => (
                        <div key={index} className="timeline-item-mini">
                          <span className="timeline-dot-mini"></span>
                          <div>
                            <p className="update-status">{update.status}</p>
                            {update.location && (
                              <p className="update-location">
                                {update.location}
                              </p>
                            )}
                            <p className="update-time">
                              {formatDate(update.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="delivery-quick-actions">
                  {order.orderStatus === "Placed" && (
                    <button
                      onClick={() => quickStatusUpdate(order._id, "Confirmed")}
                      className="btn btn-sm btn-success"
                    >
                      ✅ Confirm
                    </button>
                  )}
                  {order.orderStatus === "Confirmed" && (
                    <button
                      onClick={() => quickStatusUpdate(order._id, "Processing")}
                      className="btn btn-sm btn-primary"
                    >
                      ⚙️ Processing
                    </button>
                  )}
                  {order.orderStatus === "Processing" && (
                    <button
                      onClick={() => quickStatusUpdate(order._id, "Shipped")}
                      className="btn btn-sm btn-primary"
                    >
                      📦 Ship
                    </button>
                  )}
                  {order.orderStatus === "Shipped" && (
                    <button
                      onClick={() =>
                        quickStatusUpdate(order._id, "Out for Delivery")
                      }
                      className="btn btn-sm btn-primary"
                    >
                      🚚 Out for Delivery
                    </button>
                  )}
                  {order.orderStatus === "Out for Delivery" && (
                    <button
                      onClick={() => quickStatusUpdate(order._id, "Delivered")}
                      className="btn btn-sm btn-success"
                    >
                      🎉 Delivered
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn btn-sm btn-secondary"
                  >
                    📝 Add Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Update Modal */}
        {selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add Delivery Update</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="modal-close"
                >
                  ✕
                </button>
              </div>

              <div className="modal-order-info">
                <p>
                  <strong>Order:</strong> #
                  {selectedOrder.orderId || selectedOrder._id.slice(-8)}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {selectedOrder.shippingAddress.fullName}
                </p>
                <p>
                  <strong>Current Status:</strong> {selectedOrder.orderStatus}
                </p>
              </div>

              <form
                onSubmit={addDeliveryUpdate}
                className="delivery-update-form"
              >
                <div className="form-group">
                  <label>Status Update *</label>
                  <select
                    name="status"
                    value={updateForm.status}
                    onChange={handleUpdateChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Order Confirmed">Order Confirmed</option>
                    <option value="Package Being Prepared">
                      Package Being Prepared
                    </option>
                    <option value="Picked Up by Courier">
                      Picked Up by Courier
                    </option>
                    <option value="In Transit">In Transit</option>
                    <option value="Reached Local Hub">Reached Local Hub</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivery Attempted">
                      Delivery Attempted
                    </option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={updateForm.location}
                    onChange={handleUpdateChange}
                    placeholder="e.g., Mumbai Sorting Facility"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={updateForm.description}
                    onChange={handleUpdateChange}
                    placeholder="Add more details about this update..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Add Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryManagement;
