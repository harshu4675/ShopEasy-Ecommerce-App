import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, formatPrice } from "../../utils/api";
import Loader from "../../components/Loader";
import "../../styles/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening with ShopEasy today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">👥</div>
            <div className="stat-info">
              <p className="stat-value">{stats.totalUsers}</p>
              <p className="stat-label">Total Customers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon products">📦</div>
            <div className="stat-info">
              <p className="stat-value">{stats.totalProducts}</p>
              <p className="stat-label">Total Products</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">🛒</div>
            <div className="stat-info">
              <p className="stat-value">{stats.totalOrders}</p>
              <p className="stat-label">Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-info">
              <p className="stat-value">{formatPrice(stats.totalRevenue)}</p>
              <p className="stat-label">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="order-stats-grid">
          <div className="order-stat pending">
            <span className="order-stat-icon">⏳</span>
            <div>
              <p className="order-stat-value">{stats.pendingOrders}</p>
              <p className="order-stat-label">Pending Orders</p>
            </div>
          </div>
          <div className="order-stat processing">
            <span className="order-stat-icon">🔄</span>
            <div>
              <p className="order-stat-value">{stats.processingOrders}</p>
              <p className="order-stat-label">In Progress</p>
            </div>
          </div>
          <div className="order-stat delivered">
            <span className="order-stat-icon">✅</span>
            <div>
              <p className="order-stat-value">{stats.deliveredOrders}</p>
              <p className="order-stat-label">Delivered</p>
            </div>
          </div>
          <div className="order-stat cancelled">
            <span className="order-stat-icon">❌</span>
            <div>
              <p className="order-stat-value">{stats.cancelledOrders}</p>
              <p className="order-stat-label">Cancelled</p>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Refund Stats (Add this section) */}
        {(stats.refundRequested > 0 || stats.refunded > 0) && (
          <div className="refund-stats-grid">
            <div className="refund-stat pending">
              <span className="refund-stat-icon">💳</span>
              <div>
                <p className="refund-stat-value">
                  {stats.refundRequested || 0}
                </p>
                <p className="refund-stat-label">Pending Refunds</p>
              </div>
            </div>
            <div className="refund-stat completed">
              <span className="refund-stat-icon">✅</span>
              <div>
                <p className="refund-stat-value">{stats.refunded || 0}</p>
                <p className="refund-stat-label">Refunds Completed</p>
              </div>
            </div>
            <div className="refund-stat amount">
              <span className="refund-stat-icon">💰</span>
              <div>
                <p className="refund-stat-value">
                  {formatPrice(stats.totalRefunded || 0)}
                </p>
                <p className="refund-stat-label">Total Refunded</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/admin/add-product" className="action-btn primary">
              <span>➕</span> Add Product
            </Link>
            <Link to="/admin/products" className="action-btn">
              <span>📦</span> Manage Products
            </Link>
            <Link to="/admin/orders" className="action-btn">
              <span>🛒</span> View Orders
            </Link>
            <Link to="/admin/delivery" className="action-btn">
              <span>🚚</span> Delivery Updates
            </Link>
            {/* ✅ ADD THIS BUTTON */}
            <Link to="/admin/refunds" className="action-btn warning">
              <span>💳</span> Refund Requests
              {stats.refundRequested > 0 && (
                <span className="badge">{stats.refundRequested}</span>
              )}
            </Link>
            <Link to="/admin/coupons" className="action-btn">
              <span>🎟️</span> Manage Coupons
            </Link>
            <Link to="/admin/users" className="action-btn">
              <span>👥</span> View Users
            </Link>
            <Link to="/admin/reviews" className="action-btn">
              <span>⭐</span> Manage Reviews
            </Link>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all">
                View All →
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="no-data">No orders yet</p>
            ) : (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          #{order.orderId?.slice(-8) || order._id.slice(-8)}
                        </td>
                        <td>{order.user?.name || "N/A"}</td>
                        <td>{formatPrice(order.totalAmount)}</td>
                        <td>
                          <span
                            className={`status ${order.orderStatus.toLowerCase().replace(" ", "-")}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Products */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Low Stock Alert</h2>
              <Link to="/admin/products" className="view-all">
                View All →
              </Link>
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <p className="no-data">All products are well stocked</p>
            ) : (
              <div className="low-stock-list">
                {stats.lowStockProducts.map((product) => (
                  <div key={product._id} className="low-stock-item">
                    <img src={product.images[0]} alt={product.name} />
                    <div className="low-stock-info">
                      <p className="product-name">{product.name}</p>
                      <p className="stock-count">
                        {product.stock === 0 ? (
                          <span className="out-of-stock">Out of Stock</span>
                        ) : (
                          <span className="low-stock">
                            Only {product.stock} left
                          </span>
                        )}
                      </p>
                    </div>
                    <Link
                      to={`/admin/edit-product/${product._id}`}
                      className="btn btn-sm btn-secondary"
                    >
                      Update
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
