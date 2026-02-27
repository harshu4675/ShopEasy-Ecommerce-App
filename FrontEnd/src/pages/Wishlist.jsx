import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, formatPrice } from "../utils/api";
import { showToast } from "../utils/toast";
import Loader from "../components/Loader";
import "../styles/Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data);
    } catch (error) {
      showToast("Error loading wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await api.delete(`/wishlist/remove/${productId}`);
      setWishlist(response.data);
      showToast("Removed from wishlist", "success");
    } catch (error) {
      showToast("Error removing item", "error");
    }
  };

  const moveToCart = async (product) => {
    try {
      await api.post("/cart/add", {
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || "",
        color: product.colors?.[0]?.name || "",
      });
      await removeItem(product._id);
      showToast("Moved to cart! 🛒", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error moving to cart",
        "error",
      );
    }
  };

  if (loading) return <Loader fullScreen />;

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <div className="wishlist-page empty-wishlist">
        <div className="container">
          <div className="empty-state">
            <span className="empty-state-icon">♡</span>
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite items here for later</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{wishlist.products.length} items saved</p>
        </div>

        <div className="wishlist-grid">
          {wishlist.products.map((product) => (
            <div key={product._id} className="wishlist-item">
              <button
                className="remove-btn"
                onClick={() => removeItem(product._id)}
                title="Remove from wishlist"
              >
                ✕
              </button>

              <Link to={`/product/${product._id}`} className="item-image">
                <img src={product.images[0]} alt={product.name} />
                {product.discount > 0 && (
                  <span className="discount-badge">
                    {product.discount}% OFF
                  </span>
                )}
              </Link>

              <div className="item-info">
                <span className="item-brand">{product.brand}</span>
                <Link to={`/product/${product._id}`} className="item-name">
                  {product.name}
                </Link>

                <div className="item-rating">
                  <span className="stars">
                    {"★".repeat(Math.round(product.rating))}
                  </span>
                  <span className="rating-count">({product.numReviews})</span>
                </div>

                <div className="item-pricing">
                  <span className="current-price">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="item-stock">
                  {product.stock > 0 ? (
                    <span className="in-stock">In Stock</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </div>

                <button
                  className="btn btn-primary btn-block"
                  onClick={() => moveToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? "🛒 Move to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
