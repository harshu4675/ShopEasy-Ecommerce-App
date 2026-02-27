import React from "react";
import { Link } from "react-router-dom";
import "../styles/LegalPages.css";

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="container">
          <div className="legal-hero-content">
            <span className="legal-icon">🔒</span>
            <h1>Privacy Policy</h1>
            <p>Your privacy is important to us</p>
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
                  <a href="#introduction">Introduction</a>
                </li>
                <li>
                  <a href="#information-we-collect">Information We Collect</a>
                </li>
                <li>
                  <a href="#how-we-use">How We Use Your Information</a>
                </li>
                <li>
                  <a href="#cookies">Cookies & Tracking</a>
                </li>
                <li>
                  <a href="#data-security">Data Security</a>
                </li>
                <li>
                  <a href="#your-rights">Your Rights</a>
                </li>
                <li>
                  <a href="#contact">Contact Us</a>
                </li>
              </ul>
            </div>

            {/* Content Sections */}
            <div className="legal-sections">
              <section id="introduction" className="legal-section">
                <div className="section-icon">👋</div>
                <h2>Introduction</h2>
                <p>
                  Welcome to <strong>ShopEasy</strong>! We are committed to
                  protecting your personal information and your right to
                  privacy. This Privacy Policy explains how we collect, use, and
                  safeguard your information when you visit our website and make
                  purchases.
                </p>
                <p>
                  By using our services, you agree to the collection and use of
                  information in accordance with this policy. If you have any
                  questions, please contact us at{" "}
                  <a href="mailto:harshu6278@gmail.com">harshu6278@gmail.com</a>
                  .
                </p>
              </section>

              <section id="information-we-collect" className="legal-section">
                <div className="section-icon">📝</div>
                <h2>Information We Collect</h2>
                <p>We collect the following types of information:</p>

                <div className="info-card">
                  <h4>🧑 Personal Information</h4>
                  <ul>
                    <li>
                      <strong>Name:</strong> To personalize your experience and
                      orders
                    </li>
                    <li>
                      <strong>Email Address:</strong> For order confirmations
                      and updates
                    </li>
                    <li>
                      <strong>Phone Number:</strong> For delivery coordination
                      and OTP verification
                    </li>
                    <li>
                      <strong>Shipping Address:</strong> To deliver your orders
                    </li>
                  </ul>
                </div>

                <div className="info-card">
                  <h4>💳 Payment Information</h4>
                  <ul>
                    <li>
                      Payment method details (processed securely by payment
                      gateways)
                    </li>
                    <li>Transaction history for your records</li>
                    <li>
                      We do NOT store your complete card details on our servers
                    </li>
                  </ul>
                </div>

                <div className="info-card">
                  <h4>📱 Device Information</h4>
                  <ul>
                    <li>Browser type and version</li>
                    <li>Device type (mobile, desktop, tablet)</li>
                    <li>IP address for security purposes</li>
                  </ul>
                </div>
              </section>

              <section id="how-we-use" className="legal-section">
                <div className="section-icon">⚙️</div>
                <h2>How We Use Your Information</h2>
                <p>We use your information for the following purposes:</p>

                <div className="use-grid">
                  <div className="use-item">
                    <span className="use-icon">🛒</span>
                    <h4>Order Processing</h4>
                    <p>
                      To process and fulfill your orders, including shipping and
                      delivery
                    </p>
                  </div>
                  <div className="use-item">
                    <span className="use-icon">📧</span>
                    <h4>Communication</h4>
                    <p>
                      To send order updates, promotional offers, and important
                      notifications
                    </p>
                  </div>
                  <div className="use-item">
                    <span className="use-icon">🔐</span>
                    <h4>Account Security</h4>
                    <p>
                      To verify your identity and protect your account from
                      unauthorized access
                    </p>
                  </div>
                  <div className="use-item">
                    <span className="use-icon">📊</span>
                    <h4>Improvement</h4>
                    <p>
                      To improve our website, products, and customer service
                    </p>
                  </div>
                </div>
              </section>

              <section id="cookies" className="legal-section">
                <div className="section-icon">🍪</div>
                <h2>Cookies & Tracking Technologies</h2>
                <p>
                  Yes, we use cookies and similar tracking technologies to
                  enhance your browsing experience. Cookies are small files
                  stored on your device that help us:
                </p>

                <div className="cookie-types">
                  <div className="cookie-item">
                    <h4>Essential Cookies</h4>
                    <p>
                      Required for the website to function properly (login,
                      cart, checkout)
                    </p>
                    <span className="cookie-badge required">Required</span>
                  </div>
                  <div className="cookie-item">
                    <h4>Preference Cookies</h4>
                    <p>Remember your preferences and settings</p>
                    <span className="cookie-badge optional">Optional</span>
                  </div>
                  <div className="cookie-item">
                    <h4>Analytics Cookies</h4>
                    <p>Help us understand how visitors use our website</p>
                    <span className="cookie-badge optional">Optional</span>
                  </div>
                </div>

                <div className="info-box">
                  <span className="info-icon">💡</span>
                  <p>
                    You can manage cookie preferences in your browser settings.
                    However, disabling essential cookies may affect website
                    functionality.
                  </p>
                </div>
              </section>

              <section id="data-security" className="legal-section">
                <div className="section-icon">🛡️</div>
                <h2>Data Security</h2>
                <p>
                  We take your data security seriously and implement various
                  measures to protect your information:
                </p>

                <div className="security-features">
                  <div className="security-item">
                    <span>🔐</span>
                    <div>
                      <h4>SSL Encryption</h4>
                      <p>
                        All data transmitted is encrypted using SSL technology
                      </p>
                    </div>
                  </div>
                  <div className="security-item">
                    <span>🔒</span>
                    <div>
                      <h4>Secure Servers</h4>
                      <p>Your data is stored on secure, protected servers</p>
                    </div>
                  </div>
                  <div className="security-item">
                    <span>👥</span>
                    <div>
                      <h4>Limited Access</h4>
                      <p>
                        Only authorized personnel can access your information
                      </p>
                    </div>
                  </div>
                  <div className="security-item">
                    <span>🚫</span>
                    <div>
                      <h4>No Third-Party Sharing</h4>
                      <p>We do NOT share your data with third parties</p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="your-rights" className="legal-section">
                <div className="section-icon">✅</div>
                <h2>Your Rights</h2>
                <p>
                  You have the following rights regarding your personal data:
                </p>

                <div className="rights-list">
                  <div className="right-item">
                    <span className="right-icon">👁️</span>
                    <div>
                      <h4>Right to Access</h4>
                      <p>Request a copy of your personal data we hold</p>
                    </div>
                  </div>
                  <div className="right-item">
                    <span className="right-icon">✏️</span>
                    <div>
                      <h4>Right to Correction</h4>
                      <p>Request correction of inaccurate personal data</p>
                    </div>
                  </div>
                  <div className="right-item">
                    <span className="right-icon">🗑️</span>
                    <div>
                      <h4>Right to Deletion</h4>
                      <p>Request deletion of your personal data</p>
                    </div>
                  </div>
                  <div className="right-item">
                    <span className="right-icon">📤</span>
                    <div>
                      <h4>Right to Data Portability</h4>
                      <p>Request your data in a portable format</p>
                    </div>
                  </div>
                </div>

                <p className="rights-note">
                  To exercise any of these rights, please contact us at{" "}
                  <a href="mailto:harshu6278@gmail.com">harshu6278@gmail.com</a>
                  .
                </p>
              </section>

              <section id="contact" className="legal-section">
                <div className="section-icon">📞</div>
                <h2>Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
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

export default PrivacyPolicy;
