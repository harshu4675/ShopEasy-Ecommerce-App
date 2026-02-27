import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { showToast } from "../utils/toast";
import CouponCard from "../components/CouponCard";
import Loader from "../components/Loader";
import "../styles/Coupons.css";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/coupons");
        setCoupons(response.data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code ${code} copied! 📋`, "success");
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="coupons-page">
      <div className="container">
        <div className="coupons-header">
          <h1>🎟️ Available Offers</h1>
          <p>Use these coupons at checkout to get amazing discounts</p>
        </div>

        {coupons.length === 0 ? (
          <div className="no-coupons">
            <span className="no-coupons-icon">🎫</span>
            <h3>No coupons available right now</h3>
            <p>Check back later for exciting offers!</p>
          </div>
        ) : (
          <div className="coupons-grid">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}

        <div className="coupons-info">
          <h3>💡 How to use coupons</h3>
          <ol>
            <li>Copy the coupon code by clicking the "Copy" button</li>
            <li>Add items to your cart</li>
            <li>Go to checkout and paste the code in the coupon field</li>
            <li>Click "Apply" to get your discount!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
