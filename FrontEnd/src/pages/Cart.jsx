import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import Loader from "../components/Loader";
import "../styles/Cart.css";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Cart fetch error:", error);
      showToast("Error loading cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity, size, color) => {
    if (quantity < 1) return;

    try {
      const response = await api.put("/cart/update", {
        productId,
        quantity,
        size,
        color,
      });
      setCart(response.data);
    } catch (error) {
      console.error("Update quantity error:", error);
      showToast(
        error.response?.data?.message || "Error updating cart",
        "error",
      );
    }
  };

  const removeItem = async (productId, size, color) => {
    const itemKey = `${productId}-${size}-${color}`;
    setRemovingItem(itemKey);

    try {
      // Try multiple endpoint formats
      let response;

      // Method 1: Query params
      try {
        response = await api.delete(
          `/cart/remove/${productId}?size=${encodeURIComponent(size || "")}&color=${encodeURIComponent(color || "")}`,
        );
      } catch (err) {
        console.log("Method 1 failed, trying method 2...");

        // Method 2: Request body
        response = await api.delete(`/cart/remove/${productId}`, {
          data: { size, color },
        });
      }

      if (response && response.data) {
        setCart(response.data);
        showToast("Item removed from cart ✓", "success");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      console.error("Error details:", error.response?.data);

      // Fallback: refresh cart
      try {
        await fetchCart();
        showToast("Please try again", "warning");
      } catch (fetchError) {
        showToast("Error removing item", "error");
      }
    } finally {
      setRemovingItem(null);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast("Please enter a coupon code", "warning");
      return;
    }

    setCouponLoading(true);
    try {
      const response = await api.post("/cart/apply-coupon", {
        code: couponCode.trim().toUpperCase(),
      });
      setCart(response.data);
      showToast("Coupon applied successfully! 🎉", "success");
      setCouponCode("");
    } catch (error) {
      console.error("Apply coupon error:", error);
      showToast(
        error.response?.data?.message || "Invalid coupon code",
        "error",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await api.delete("/cart/remove-coupon");
      setCart(response.data);
      showToast("Coupon removed ✓", "success");
    } catch (error) {
      console.error("Remove coupon error:", error);
      showToast("Error removing coupon", "error");
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items || cart.items.length === 0) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0);
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
    const subtotal = calculateSubtotal();
    return subtotal >= 199 ? 0 : 49;
  };

  const calculateTotal = () => {
    return Math.max(
      0,
      calculateSubtotal() - calculateDiscount() + calculateDelivery(),
    );
  };

  const getRemainingForFreeDelivery = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, 199 - subtotal);
  };

  if (loading) return <Loader fullScreen />;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p className="cart-count">
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => {
              const itemKey = `${item.product._id}-${item.size || ""}-${item.color || ""}`;
              const isRemoving = removingItem === itemKey;

              return (
                <div
                  key={itemKey}
                  className={`cart-item ${isRemoving ? "removing" : ""}`}
                >
                  <Link
                    to={`/product/${item.product._id}`}
                    className="item-image"
                  >
                    <img
                      src={item.product.images?.[0] || "/placeholder.jpg"}
                      alt={item.product.name || "Product"}
                    />
                  </Link>

                  <div className="item-details">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="item-name"
                    >
                      {item.product.name || "Product"}
                    </Link>
                    {item.product.brand && (
                      <p className="item-brand">{item.product.brand}</p>
                    )}
                    <div className="item-options">
                      {item.size && (
                        <span className="option-badge">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="option-badge">
                          Color: {item.color}
                        </span>
                      )}
                    </div>
                    <p className="item-price">
                      {formatPrice(item.product.price || 0)}
                    </p>
                    {item.product.stock < 10 && item.product.stock > 0 && (
                      <p className="stock-warning">
                        Only {item.product.stock} left in stock
                      </p>
                    )}
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity - 1,
                          item.size,
                          item.color,
                        )
                      }
                      disabled={item.quantity <= 1 || isRemoving}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity + 1,
                          item.size,
                          item.color,
                        )
                      }
                      disabled={
                        item.quantity >= (item.product.stock || 0) || isRemoving
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    {formatPrice(
                      (item.product.price || 0) * (item.quantity || 0),
                    )}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeItem(item.product._id, item.size, item.color)
                    }
                    disabled={isRemoving}
                    aria-label="Remove item"
                    title="Remove from cart"
                  >
                    {isRemoving ? "..." : "✕"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            {/* Coupon Section */}
            <div className="coupon-section">
              {cart.appliedCoupon ? (
                <div className="applied-coupon">
                  <div className="coupon-info">
                    <span className="coupon-icon">🎟️</span>
                    <div>
                      <span className="coupon-code">
                        {cart.appliedCoupon.code}
                      </span>
                      <span className="coupon-discount">
                        You saved{" "}
                        {cart.appliedCoupon.discountType === "percentage"
                          ? `${cart.appliedCoupon.discountValue}%`
                          : formatPrice(cart.appliedCoupon.discountValue)}
                      </span>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="remove-coupon">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="coupon-input-wrapper">
                  <div className="coupon-input">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      onKeyPress={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <button
                      onClick={applyCoupon}
                      className="apply-btn"
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  <Link to="/coupons" className="view-coupons">
                    🎁 View available coupons
                  </Link>
                </div>
              )}
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>

              {calculateDiscount() > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span className="discount-value">
                    −{formatPrice(calculateDiscount())}
                  </span>
                </div>
              )}

              <div className="summary-row">
                <span>Delivery</span>
                <span className={calculateDelivery() === 0 ? "free-text" : ""}>
                  {calculateDelivery() === 0
                    ? "FREE"
                    : formatPrice(calculateDelivery())}
                </span>
              </div>

              {getRemainingForFreeDelivery() > 0 && (
                <p className="free-delivery-hint">
                  🚚 Add {formatPrice(getRemainingForFreeDelivery())} more for
                  FREE delivery
                </p>
              )}
            </div>

            <div className="summary-total">
              <span>Total Amount</span>
              <span className="total-amount">
                {formatPrice(calculateTotal())}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn btn-primary btn-lg btn-block checkout-btn"
            >
              Proceed to Checkout →
            </button>

            <Link to="/products" className="continue-shopping">
              ← Continue Shopping
            </Link>

            <div className="payment-methods">
              <p>We accept:</p>
              <div className="payment-icons">
                <span>💳</span>
                <span>💰</span>
                <span>📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
