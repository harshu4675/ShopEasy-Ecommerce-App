import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand">
            <Logo size="default" />
            <p>
              Your one-stop destination for fashion, accessories, and lifestyle
              products. Shop the latest trends at unbeatable prices!
            </p>
            <div className="social-links">
              <a href="#facebook" aria-label="Facebook">
                📘
              </a>
              <a href="#instagram" aria-label="Instagram">
                📷
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Shop</h4>
            <ul>
              <li>
                <Link to="/products?category=Men's Clothing">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=Women's Clothing">
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=Kids' Clothing">Kids' Wear</Link>
              </li>
              <li>
                <Link to="/products?category=Perfumes">Perfumes</Link>
              </li>
              <li>
                <Link to="/products?category=Accessories">Accessories</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Help</h4>
            <ul>
              <li>
                <a href="/contact">FAQ</a>
              </li>

              <li>
                <a href="#track">Track Order</a>
              </li>
              <li>
                <a href="#contact">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <p>
            &copy; {new Date().getFullYear()} ShopEasy. All rights reserved.
          </p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className="payment-methods">
            <span>💳 Visa</span>
            <span>💳 Mastercard</span>
            <span>📱 UPI</span>
            <span>🏦 Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
