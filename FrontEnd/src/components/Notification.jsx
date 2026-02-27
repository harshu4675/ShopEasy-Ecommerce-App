import React from "react";
import { Link } from "react-router-dom";
import "../styles/Notification.css";

const NotificationItem = ({ notification, onMarkRead }) => {
  const getIcon = (type) => {
    const icons = {
      order: "📦",
      delivery: "🚚",
      offer: "🎉",
      coupon: "🎟️",
      system: "📢",
    };
    return icons[type] || "🔔";
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? "read" : "unread"}`}
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
    >
      <div className="notification-icon">{getIcon(notification.type)}</div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="notification-time">
          {formatTime(notification.createdAt)}
        </span>
      </div>
      {notification.orderId && (
        <Link
          to={`/my-orders`}
          className="notification-action"
          onClick={(e) => e.stopPropagation()}
        >
          View Order
        </Link>
      )}
      {!notification.isRead && <div className="unread-dot"></div>}
    </div>
  );
};

export default NotificationItem;
