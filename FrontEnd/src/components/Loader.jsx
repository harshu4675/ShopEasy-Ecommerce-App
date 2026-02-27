import React from "react";
import "../styles/Loader.css";

const Loader = ({ size = "default", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-content">
          <div className="loader-logo">
            <div className="logo-icon">SE</div>
          </div>
          <div className="loader-spinner"></div>
          <p className="loader-text">Loading ShopEasy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`loader-container loader-${size}`}>
      <div className="loader-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Loader;
