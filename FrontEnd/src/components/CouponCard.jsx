import React from "react";
import { formatPrice } from "../utils/api";
import "../styles/Coupons.css";

const CouponCard = ({ coupon, onCopy }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExpiringSoon = () => {
    const daysLeft = Math.ceil(
      (new Date(coupon.validUntil) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return daysLeft <= 3 && daysLeft > 0;
  };

  return (
    <div className="coupon-card">
      <div className="coupon-left">
        <div className="coupon-discount">
          {coupon.discountType === "percentage" ? (
            <>
              <span className="discount-value">{coupon.discountValue}%</span>
              <span className="discount-label">OFF</span>
            </>
          ) : (
            <>
              <span className="discount-value">
                {formatPrice(coupon.discountValue)}
              </span>
              <span className="discount-label">OFF</span>
            </>
          )}
        </div>
      </div>

      <div className="coupon-right">
        <div className="coupon-code-section">
          <span className="coupon-code">{coupon.code}</span>
          <button onClick={() => onCopy(coupon.code)} className="copy-btn">
            📋 Copy
          </button>
        </div>

        <p className="coupon-description">{coupon.description}</p>

        <div className="coupon-details">
          {coupon.minOrderAmount > 0 && (
            <span className="coupon-condition">
              Min. order: {formatPrice(coupon.minOrderAmount)}
            </span>
          )}
          {coupon.maxDiscountAmount && (
            <span className="coupon-condition">
              Max discount: {formatPrice(coupon.maxDiscountAmount)}
            </span>
          )}
        </div>

        <div className="coupon-validity">
          <span className={isExpiringSoon() ? "expiring-soon" : ""}>
            Valid till: {formatDate(coupon.validUntil)}
            {isExpiringSoon() && " ⚡ Expiring Soon!"}
          </span>
        </div>
      </div>

      <div className="coupon-circles">
        <div className="circle top"></div>
        <div className="circle bottom"></div>
      </div>
    </div>
  );
};

export default CouponCard;
