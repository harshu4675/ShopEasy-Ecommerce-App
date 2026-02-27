import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/WelcomeBanner.css";

const WelcomeBanner = () => {
  const { user } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const isDismissed = sessionStorage.getItem("welcomeBannerDismissed");
    if (isDismissed === "true") {
      setIsVisible(false);
    }

    // Auto-hide for logged-in users after 10 seconds
    if (user) {
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("welcomeBannerDismissed", "true");
    }, 300);
  };

  const copyCode = () => {
    navigator.clipboard.writeText("WELCOME100");
    const btn = document.querySelector(".copy-code-btn");
    if (btn) {
      btn.textContent = "Copied! ✓";
      setTimeout(() => {
        btn.textContent = "Copy Code";
      }, 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`welcome-banner ${isClosing ? "closing" : ""}`}>
      <div className="welcome-banner-container">
        <div className="welcome-banner-content">
          <span className="welcome-banner-icon">🎉</span>
          <div className="welcome-banner-text">
            <span className="welcome-banner-title">
              {user
                ? `Welcome back, ${user.name?.split(" ")[0] || "Friend"}!`
                : "Welcome to ShopEasy!"}
            </span>
            <span className="welcome-banner-message">
              Get <strong>₹100 OFF</strong> on your first order with code{" "}
              <span className="coupon-code">WELCOME100</span>
            </span>
          </div>
        </div>

        <div className="welcome-banner-actions">
          <button onClick={copyCode} className="copy-code-btn">
            Copy Code
          </button>
          <Link to="/products" className="shop-now-btn">
            Shop Now →
          </Link>
          <button
            onClick={handleClose}
            className="close-banner-btn"
            aria-label="Close banner"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar for auto-close (only for logged-in users) */}
      {user && (
        <div className="banner-progress">
          <div className="banner-progress-bar"></div>
        </div>
      )}
    </div>
  );
};

export default WelcomeBanner;
