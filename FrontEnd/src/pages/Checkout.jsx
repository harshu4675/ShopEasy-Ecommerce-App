import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatPrice } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Loader from "../components/Loader";
import "../styles/Checkout.css";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "COD",
  });

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
  ];

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCart = useCallback(async () => {
    try {
      const response = await api.get("/cart");
      if (!response.data || response.data.items.length === 0) {
        showToast("Your cart is empty", "error");
        navigate("/cart");
        return;
      }
      setCart(response.data);
    } catch (error) {
      showToast("Error loading cart", "error");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  };

  const calculateDiscount = () => {
    if (!cart?.appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (cart.appliedCoupon.discountType === "percentage") {
      let discount = (subtotal * cart.appliedCoupon.discountValue) / 100;
      if (cart.appliedCoupon.maxDiscountAmount) {
        discount = Math.min(discount, cart.appliedCoupon.maxDiscountAmount);
      }
      return discount;
    }
    return cart.appliedCoupon.discountValue;
  };

  const calculateDelivery = () => {
    return calculateSubtotal() >= 199 ? 0 : 49;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateDelivery();
  };

  const validateStep1 = () => {
    const { fullName, phone, address, city, state, pincode } = formData;
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      showToast("Please fill all address fields", "error");
      return false;
    }
    if (phone.length !== 10) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return false;
    }
    if (pincode.length !== 6) {
      showToast("Please enter a valid 6-digit pincode", "error");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // Razorpay Payment Handler
  const handleRazorpayPayment = async () => {
    setSubmitting(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast("Failed to load Razorpay SDK. Please try again.", "error");
        setSubmitting(false);
        return;
      }

      // Create Razorpay order
      const totalAmount = calculateTotal();
      const orderResponse = await api.post("/payment/create-order", {
        amount: totalAmount,
        currency: "INR",
      });

      const { order, key_id } = orderResponse.data;

      // Razorpay options
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Your Store Name",
        description: "Purchase from Your Store",
        order_id: order.id,
        prefill: {
          name: formData.fullName,
          email: user?.email || "",
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
        theme: {
          color: "#3399cc",
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              // Create order after successful payment
              await createOrder(response.razorpay_payment_id);
            } else {
              showToast("Payment verification failed", "error");
              setSubmitting(false);
            }
          } catch (error) {
            showToast("Payment verification error", "error");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            showToast("Payment cancelled", "info");
            setSubmitting(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      showToast(
        error.response?.data?.message || "Error initiating payment",
        "error",
      );
      setSubmitting(false);
    }
  };

  // Create Order (After payment or for COD)
  const createOrder = async (paymentId = null) => {
    try {
      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: formData.paymentMethod,
        ...(paymentId && { razorpayPaymentId: paymentId }),
      };

      await api.post("/orders", orderData);
      showToast("Order placed successfully! 🎉", "success");
      navigate("/my-orders");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error placing order",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.paymentMethod === "Razorpay") {
      await handleRazorpayPayment();
    } else if (formData.paymentMethod === "COD") {
      setSubmitting(true);
      await createOrder();
    } else {
      showToast("This payment method is coming soon!", "info");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? "active" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">Address</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form-section">
            {step === 1 && (
              <div className="address-form">
                <h2>📍 Delivery Address</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House No., Building, Street, Area"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="btn btn-primary btn-lg btn-block"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="payment-form">
                <h2>💳 Payment Method</h2>

                <div className="payment-options">
                  <label
                    className={`payment-option ${formData.paymentMethod === "COD" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleChange}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">💵</span>
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`payment-option ${formData.paymentMethod === "Razorpay" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={formData.paymentMethod === "Razorpay"}
                      onChange={handleChange}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">🔐</span>
                      <div>
                        <strong>Pay Online</strong>
                        <p>UPI, Cards, NetBanking, Wallets</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="delivery-address-summary">
                  <h3>Delivering to:</h3>
                  <p>
                    <strong>{formData.fullName}</strong>
                  </p>
                  <p>{formData.address}</p>
                  <p>
                    {formData.city}, {formData.state} - {formData.pincode}
                  </p>
                  <p>Phone: {formData.phone}</p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="change-address"
                  >
                    Change Address
                  </button>
                </div>

                <div className="checkout-actions">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Processing..."
                      : `Place Order • ${formatPrice(calculateTotal())}`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-items">
              {cart?.items.map((item) => (
                <div
                  key={`${item.product._id}-${item.size}-${item.color}`}
                  className="summary-item"
                >
                  <div className="summary-item-image">
                    <img src={item.product.images[0]} alt={item.product.name} />
                    <span className="item-qty">{item.quantity}</span>
                  </div>
                  <div className="summary-item-info">
                    <p className="summary-item-name">{item.product.name}</p>
                    <p className="summary-item-options">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && " | "}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  </div>
                  <p className="summary-item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({cart?.items.length} items)</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              {calculateDiscount() > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-{formatPrice(calculateDiscount())}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery</span>
                <span>
                  {calculateDelivery() === 0
                    ? "FREE"
                    : formatPrice(calculateDelivery())}
                </span>
              </div>
            </div>

            <div className="summary-total">
              <span>Total Amount</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>

            <div className="secure-checkout">
              <span>🔒</span>
              <p>Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
