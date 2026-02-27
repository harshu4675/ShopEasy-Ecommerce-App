import React, { useContext, useEffect, useCallback } from "react";
import { NotificationContext } from "../context/NotificationContext";
import NotificationItem from "../components/Notification";
import Loader from "../components/Loader";
import "../styles/Notification.css";

const Notifications = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } =
    useContext(NotificationContext);

  const loadNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  if (!notifications) return <Loader fullScreen />;

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <p className="unread-count">{unreadCount} unread notifications</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-btn">
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notifications-icon">🔔</span>
            <h3>No notifications yet</h3>
            <p>We'll notify you when something important happens</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
