import React from "react";
import { Link } from "react-router-dom";
import "../styles/LegalPages.css";

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="container">
          <div className="legal-hero-content">
            <span className="legal-icon">📜</span>
            <h1>Terms of Service</h1>
            <p>Please read these terms carefully before using our services</p>
            <span className="last-updated">Last Updated: January 2025</span>
          </div>
        </div>
        <div className="legal-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="#f8f9ff"
            />
          </svg>
        </div>
      </div>

      <div className="legal-content">
        <div className="container">
          <div className="legal-container">
            {/* Table of Contents */}
            <div className="table-of-contents">
              <h3>📋 Table of Contents</h3>
              <ul>
                <li>
                  <a href="#acceptance">Acceptance of Terms</a>
                </li>
                <li>
                  <a href="#account">Account Registration</a>
                </li>
                <li>
                  <a href="#orders">Orders & Payments</a>
                </li>
                <li>
                  <a href="#shipping">Shipping Policy</a>
                </li>
                <li>
                  <a href="#returns">Returns & Refunds</a>
                </li>
                <li>
                  <a href="#cancellation">Order Cancellation</a>
                </li>
                <li>
                  <a href="#prohibited">Prohibited Activities</a>
                </li>
                <li>
                  <a href="#contact">Contact Us</a>
                </li>
              </ul>
            </div>

            {/* Content Sections */}
            <div className="legal-sections">
              <section id="acceptance" className="legal-section">
                <div className="section-icon">✅</div>
                <h2>Acceptance of Terms</h2>
                <p>
                  Welcome to <strong>ShopEasy</strong>! By accessing or using
                  our website and services, you agree to be bound by these Terms
                  of Service. If you do not agree to these terms, please do not
                  use our services.
                </p>
                <div className="highlight-box">
                  <span className="highlight-icon">⚠️</span>
                  <p>
                    These terms constitute a legally binding agreement between
                    you and ShopEasy. Please read them carefully before making
                    any purchase.
                  </p>
                </div>
              </section>

              <section id="account" className="legal-section">
                <div className="section-icon">👤</div>
                <h2>Account Registration</h2>
                <p>
                  To make purchases on ShopEasy, you may need to create an
                  account. You agree to:
                </p>

                <div className="terms-list">
                  <div className="term-item">
                    <span className="term-number">1</span>
                    <div>
                      <h4>Accurate Information</h4>
                      <p>
                        Provide accurate, current, and complete information
                        during registration
                      </p>
                    </div>
                  </div>
                  <div className="term-item">
                    <span className="term-number">2</span>
                    <div>
                      <h4>Account Security</h4>
                      <p>Keep your password confidential and secure</p>
                    </div>
                  </div>
                  <div className="term-item">
                    <span className="term-number">3</span>
                    <div>
                      <h4>Account Responsibility</h4>
                      <p>
                        You are responsible for all activities under your
                        account
                      </p>
                    </div>
                  </div>
                  <div className="term-item">
                    <span className="term-number">4</span>
                    <div>
                      <h4>One Account Per Person</h4>
                      <p>
                        Do not create multiple accounts for fraudulent purposes
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="orders" className="legal-section">
                <div className="section-icon">🛒</div>
                <h2>Orders & Payments</h2>

                <div className="subsection">
                  <h3>💳 Accepted Payment Methods</h3>
                  <div className="payment-methods-grid">
                    <div className="payment-method">
                      <span>💳</span>
                      <p>Credit/Debit Cards</p>
                    </div>
                    <div className="payment-method">
                      <span>📱</span>
                      <p>UPI Payments</p>
                    </div>
                    <div className="payment-method">
                      <span>💵</span>
                      <p>Cash on Delivery (COD)</p>
                    </div>
                    <div className="payment-method">
                      <span>👛</span>
                      <p>Digital Wallets</p>
                    </div>
                  </div>
                </div>

                <div className="subsection">
                  <h3>📋 Order Terms</h3>
                  <ul className="styled-list">
                    <li>All prices are displayed in Indian Rupees (₹)</li>
                    <li>Prices are subject to change without prior notice</li>
                    <li>We reserve the right to refuse or cancel any order</li>
                    <li>
                      Order confirmation email will be sent after successful
                      payment
                    </li>
                    <li>Product availability is subject to stock</li>
                  </ul>
                </div>
              </section>

              <section id="shipping" className="legal-section">
                <div className="section-icon">🚚</div>
                <h2>Shipping Policy</h2>

                <div className="policy-cards">
                  <div className="policy-card highlight">
                    <div className="policy-icon">🎉</div>
                    <h4>Free Shipping</h4>
                    <p className="policy-value">On orders above ₹199</p>
                    <p className="policy-desc">
                      Enjoy free delivery on all orders above ₹199
                    </p>
                  </div>
                  <div className="policy-card">
                    <div className="policy-icon">📦</div>
                    <h4>Delivery Time</h4>
                    <p className="policy-value">7-8 Business Days</p>
                    <p className="policy-desc">
                      Expected delivery within 7 to 8 business days
                    </p>
                  </div>
                  <div className="policy-card">
                    <div className="policy-icon">📍</div>
                    <h4>Delivery Area</h4>
                    <p className="policy-value">All Over India</p>
                    <p className="policy-desc">
                      We deliver to all serviceable pin codes in India
                    </p>
                  </div>
                </div>

                <div className="info-box">
                  <span className="info-icon">ℹ️</span>
                  <p>
                    Delivery times may vary based on your location and product
                    availability. You will receive tracking information via
                    email and SMS once your order is shipped.
                  </p>
                </div>
              </section>

              <section id="returns" className="legal-section">
                <div className="section-icon">↩️</div>
                <h2>Returns & Refunds</h2>

                <div className="return-policy">
                  <div className="return-header">
                    <span className="return-days">7</span>
                    <div>
                      <h3>Days Return Policy</h3>
                      <p>Easy returns within 7 days of delivery</p>
                    </div>
                  </div>

                  <div className="return-conditions">
                    <h4>✅ Conditions for Return</h4>
                    <ul className="styled-list">
                      <li>Product must be unused and in original condition</li>
                      <li>Original tags and packaging must be intact</li>
                      <li>
                        Return request must be raised within 7 days of delivery
                      </li>
                      <li>Product must not be damaged by the customer</li>
                    </ul>
                  </div>

                  <div className="return-conditions">
                    <h4>❌ Non-Returnable Items</h4>
                    <ul className="styled-list warning">
                      <li>Innerwear and lingerie (due to hygiene reasons)</li>
                      <li>Customized or personalized products</li>
                      <li>Products marked as "Final Sale"</li>
                      <li>Products with broken seals (perfumes, cosmetics)</li>
                    </ul>
                  </div>

                  <div className="refund-process">
                    <h4>💰 Refund Process</h4>
                    <div className="refund-steps">
                      <div className="refund-step">
                        <span className="step-number">1</span>
                        <p>Raise return request</p>
                      </div>
                      <div className="refund-arrow">→</div>
                      <div className="refund-step">
                        <span className="step-number">2</span>
                        <p>Product pickup</p>
                      </div>
                      <div className="refund-arrow">→</div>
                      <div className="refund-step">
                        <span className="step-number">3</span>
                        <p>Quality check</p>
                      </div>
                      <div className="refund-arrow">→</div>
                      <div className="refund-step">
                        <span className="step-number">4</span>
                        <p>Refund in 5-7 days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="highlight-box warning">
                  <span className="highlight-icon">📢</span>
                  <p>
                    <strong>No Warranty:</strong> We do not provide warranty on
                    products. However, you can replace or return products within
                    the 7-day return window.
                  </p>
                </div>
              </section>

              <section id="cancellation" className="legal-section">
                <div className="section-icon">❌</div>
                <h2>Order Cancellation</h2>

                <div className="cancellation-info">
                  <div className="cancellation-allowed">
                    <div className="cancel-icon">✅</div>
                    <div>
                      <h4>Cancellation Allowed</h4>
                      <p>
                        <strong>Before Shipping Only</strong>
                      </p>
                      <p>
                        You can cancel your order anytime before it has been
                        shipped.
                      </p>
                    </div>
                  </div>

                  <div className="cancellation-not-allowed">
                    <div className="cancel-icon">❌</div>
                    <div>
                      <h4>Cancellation Not Allowed</h4>
                      <p>
                        <strong>After Shipping</strong>
                      </p>
                      <p>
                        Once the order is shipped, cancellation is not possible.
                        You can return it after delivery.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="how-to-cancel">
                  <h4>How to Cancel an Order?</h4>
                  <ol className="styled-list numbered">
                    <li>Go to "My Orders" in your account</li>
                    <li>Find the order you want to cancel</li>
                    <li>Click on "Cancel Order" button</li>
                    <li>Select the reason for cancellation</li>
                    <li>Refund will be processed within 5-7 business days</li>
                  </ol>
                </div>
              </section>

              <section id="prohibited" className="legal-section">
                <div className="section-icon">🚫</div>
                <h2>Prohibited Activities</h2>
                <p>You agree NOT to:</p>

                <div className="prohibited-grid">
                  <div className="prohibited-item">
                    <span>🤖</span>
                    <p>Use bots or automated systems</p>
                  </div>
                  <div className="prohibited-item">
                    <span>🎭</span>
                    <p>Create fake accounts or impersonate others</p>
                  </div>
                  <div className="prohibited-item">
                    <span>💔</span>
                    <p>Attempt to hack or disrupt our services</p>
                  </div>
                  <div className="prohibited-item">
                    <span>📧</span>
                    <p>Send spam or unsolicited messages</p>
                  </div>
                  <div className="prohibited-item">
                    <span>💳</span>
                    <p>Use stolen payment methods</p>
                  </div>
                  <div className="prohibited-item">
                    <span>📝</span>
                    <p>Post fake reviews or ratings</p>
                  </div>
                </div>

                <div className="highlight-box danger">
                  <span className="highlight-icon">⚠️</span>
                  <p>
                    Violation of these terms may result in immediate account
                    termination and legal action if necessary.
                  </p>
                </div>
              </section>

              <section id="contact" className="legal-section">
                <div className="section-icon">📞</div>
                <h2>Contact Us</h2>
                <p>
                  For any questions regarding these Terms of Service, please
                  contact us:
                </p>

                <div className="contact-card">
                  <div className="contact-info">
                    <div className="contact-item">
                      <span>🏢</span>
                      <div>
                        <strong>ShopEasy</strong>
                        <p>Dhar Road, Indore, MP, India</p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span>📧</span>
                      <div>
                        <strong>Email</strong>
                        <p>
                          <a href="mailto:harshu6278@gmail.com">
                            harshu6278@gmail.com
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="contact-item">
                      <span>📱</span>
                      <div>
                        <strong>Phone</strong>
                        <p>
                          <a href="tel:+917898969930">+91 78989 69930</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link to="/contact" className="btn btn-primary">
                    Contact Us →
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
