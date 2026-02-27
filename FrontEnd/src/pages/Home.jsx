import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import "../styles/Home.css";
import WelcomeBanner from "../components/WelcomeBanner";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import showToast from "../utils/toast";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      name: "Men's Clothing",

      image: "./Images/mensSection.png",
    },
    {
      name: "Women's Clothing",

      image: "./Images/womensSection.png",
    },
    {
      name: "Kids' Clothing",

      image: "./Images/kidsSection.png",
    },
    {
      name: "Perfumes",

      image: "./Images/perfumeSection.png",
    },
    {
      name: "Watches",

      image: "./Images/watchesSection.png",
    },
    {
      name: "Sunglasses",

      image: "./Images/sunglassesSection.png",
    },
    {
      name: "Bags & Wallets",

      image: "./Images/walletSection.png",
    },
    {
      name: "Jewelry",

      image: "./Images/JewSection.png",
    },
  ];

  const features = [
    { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹199" },
    { icon: "↩️", title: "Easy Returns", desc: "7-day return policy" },
    { icon: "💳", title: "Secure Payment", desc: "100% secure checkout" },
    { icon: "🎁", title: "Special Offers", desc: "Daily deals & discounts" },
  ];

  return (
    <div className="home">
      {/* Welcome Offer Banner */}
      <WelcomeBanner />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-slides">
          <div className="hero-slide active">
            <div className="hero-content">
              <span className="hero-tag">New Season Collection</span>
              <h1>
                Discover Your <span className="highlight">Perfect Style</span>
              </h1>
              <p>
                Explore the latest trends in fashion, accessories, and
                fragrances. Get up to 50% off on selected items!
              </p>
              {!user && (
                <div className="hero-offer-highlight">
                  <span className="offer-icon">🎉</span>
                  <span>
                    First-time users get ₹100 OFF! Use code:{" "}
                    <strong>WELCOME100</strong>
                  </span>
                </div>
              )}
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop Now
                </Link>
                <Link to="/coupons" className="btn btn-outline btn-lg">
                  View Offers
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="#f8f9fa"
            />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/products" className="view-all">
              View All →
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                  <div className="category-overlay">
                    <span className="category-icon">{category.icon}</span>
                  </div>
                </div>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="banner-wrapper">
            <div className="banner-content">
              <span className="banner-tag">Limited Time Offer</span>
              <h2>Get ₹100 Off on Premium Products</h2>
              <p>
                Use code <strong>WELCOME100</strong> at checkout
              </p>
              <div className="banner-features">
                <div className="banner-feature">
                  <span>🚚</span> Free Shipping
                </div>
                <div className="banner-feature">
                  <span>↩️</span> Easy Returns
                </div>
                <div className="banner-feature">
                  <span>💳</span> Secure Payment
                </div>
              </div>
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Now →
              </Link>
            </div>
            <div className="banner-image">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
                alt="Shopping"
              />
              <div className="banner-image-badge">
                <span className="badge-percent">₹100</span>
                <span className="badge-text">OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="banner-shape banner-shape-1"></div>
        <div className="banner-shape banner-shape-2"></div>
      </section>

      {/* {Newsletter } */}
      <section className="newsletter-section">
        <div className="newsletter-bg">
          <div className="newsletter-shape newsletter-shape-1"></div>
          <div className="newsletter-shape newsletter-shape-2"></div>
        </div>

        <div className="container">
          <div
            className="newsletter-content"
            style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}
          >
            <div className="newsletter-icon">📬</div>
            <h2>Stay in the Loop!</h2>
            <p>
              Subscribe to get exclusive offers, style tips, and be the first to
              know about new arrivals!
            </p>

            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Subscribed! 🎉", "success");
              }}
            >
              <div
                className="newsletter-input-wrapper"
                style={{ maxWidth: "100%" }}
              >
                <span className="input-icon"></span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  <span className="btn-text">Subscribe</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </form>

            <div
              className="newsletter-features"
              style={{ justifyContent: "center" }}
            >
              <div className="newsletter-feature">
                <span>🎁</span>
                <p>Exclusive Deals</p>
              </div>
              <div className="newsletter-feature">
                <span>🔔</span>
                <p>New Arrivals</p>
              </div>
              <div className="newsletter-feature">
                <span>🚫</span>
                <p>No Spam</p>
              </div>
            </div>

            <p className="newsletter-privacy">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
