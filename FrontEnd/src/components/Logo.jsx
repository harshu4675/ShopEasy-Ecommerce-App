import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ size = "default" }) => {
  const sizes = {
    small: { fontSize: "20px", icon: "24px" },
    default: { fontSize: "26px", icon: "32px" },
    large: { fontSize: "36px", icon: "44px" },
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <Link to="/" className="logo" style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: currentSize.icon,
            height: currentSize.icon,
            background: "linear-gradient(135deg, #e91e63, #9c27b0)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "800",
            fontSize: parseInt(currentSize.icon) * 0.5 + "px",
          }}
        >
          SE
        </div>
        <span
          style={{
            fontSize: currentSize.fontSize,
            fontWeight: "700",
            background: "linear-gradient(135deg, #e91e63, #9c27b0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ShopEasy
        </span>
      </div>
    </Link>
  );
};

export default Logo;
