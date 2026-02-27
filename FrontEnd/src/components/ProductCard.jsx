import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import "../styles/ProductCard.css";

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast("Please login to add items to cart", "error");
      return;
    }
    try {
      await api.post("/cart/add", {
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || "",
        color: product.colors?.[0]?.name || "",
      });
      showToast("Added to cart! 🛒", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error adding to cart",
        "error",
      );
    }
  };

  const addToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast("Please login to add to wishlist", "error");
      return;
    }
    try {
      await api.post(`/wishlist/add/${product._id}`);
      showToast("Added to wishlist! ♡", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error adding to wishlist",
        "error",
      );
    }
  };

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : product.discount || 0;

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      {discountPercent > 0 && (
        <span className="discount-badge">{discountPercent}% OFF</span>
      )}
      {product.isNewArrival && <span className="new-badge">NEW</span>}

      <div className="product-image">
        <img src={product.images[0]} alt={product.name} />
        <div className="product-overlay">
          <button
            onClick={addToWishlist}
            className="overlay-btn wishlist-btn"
            title="Add to Wishlist"
          >
            ♡
          </button>
          <button
            onClick={addToCart}
            className="overlay-btn cart-btn"
            title="Add to Cart"
          >
            🛒
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <span className="stars">
            {"★".repeat(Math.round(product.rating))}
          </span>
          <span className="rating-count">({product.numReviews})</span>
        </div>

        <div className="product-pricing">
          <span className="current-price">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="original-price">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="discount-text">{discountPercent}% off</span>
            </>
          )}
        </div>

        {product.stock === 0 && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
