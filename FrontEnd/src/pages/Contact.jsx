import React, { useState } from "react";
import { showToast } from "../utils/toast";
import "../styles/Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      showToast(
        "Message sent successfully! We'll get back to you soon. 📧",
        "success",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email Us",
      value: "harshu6278@gmail.com",
      link: "mailto:harshu6278@gmail.com",
      description: "We'll respond within 24 hours",
    },
    {
      icon: "📱",
      title: "Call Us",
      value: "+91 78989 69930",
      link: "tel:+917898969930",
      description: "Mon-Sat, 9 AM - 6 PM",
    },
    {
      icon: "📍",
      title: "Visit Us",
      value: "Dhar Road, Indore",
      link: null,
      description: "Madhya Pradesh, India",
    },
  ];

  const faqs = [
    {
      question: "How can I track my order?",
      answer:
        "You can track your order from the 'My Orders' section in your account. You'll also receive tracking updates via email and SMS.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy. Products must be unused and in original condition with tags intact.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Standard delivery takes 7-8 business days. You'll receive tracking information once your order is shipped.",
    },
    {
      question: "Is Cash on Delivery available?",
      answer:
        "Yes! We accept Cash on Delivery (COD) along with Cards, UPI, and Digital Wallets.",
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <span className="contact-icon">💬</span>
            <h1>Get in Touch</h1>
            <p>
              We'd love to hear from you! Send us a message and we'll respond as
              soon as possible.
            </p>
          </div>
        </div>
        <div className="contact-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="#f8f9ff"
            />
          </svg>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card">
                <div className="info-icon">{info.icon}</div>
                <h3>{info.title}</h3>
                {info.link ? (
                  <a href={info.link} className="info-value">
                    {info.value}
                  </a>
                ) : (
                  <span className="info-value">{info.value}</span>
                )}
                <p className="info-description">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & FAQ Section */}
      <div className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>
                  Fill out the form below and we'll get back to you shortly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <div className="input-icon">
                      <span className="icon">👤</span>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <div className="input-icon">
                      <span className="icon">📧</span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-icon">
                      <span className="icon">📱</span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        maxLength="10"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <div className="input-icon">
                      <span className="icon">📝</span>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="order">Order Related</option>
                        <option value="return">Return/Refund</option>
                        <option value="product">Product Inquiry</option>
                        <option value="payment">Payment Issue</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <div className="input-icon textarea-icon">
                    <span className="icon">💬</span>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      rows="5"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-loader"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <span>📨</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="faq-wrapper">
              <div className="faq-header">
                <h2>Frequently Asked Questions</h2>
                <p>Quick answers to common questions</p>
              </div>

              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <details key={index} className="faq-item">
                    <summary className="faq-question">
                      <span className="question-icon">❓</span>
                      {faq.question}
                      <span className="toggle-icon">+</span>
                    </summary>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>

              {/* Quick Links */}
              <div className="quick-links">
                <h3>Quick Links</h3>
                <div className="quick-links-grid">
                  <a href="/my-orders" className="quick-link">
                    <span>📦</span>
                    Track Order
                  </a>
                  <a href="/terms" className="quick-link">
                    <span>📜</span>
                    Terms of Service
                  </a>
                  <a href="/privacy" className="quick-link">
                    <span>🔒</span>
                    Privacy Policy
                  </a>
                  <a href="/coupons" className="quick-link">
                    <span>🎟️</span>
                    View Coupons
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Banner */}
      <div className="response-banner">
        <div className="container">
          <div className="response-content">
            <div className="response-icon">⏰</div>
            <div className="response-text">
              <h3>We typically respond within 24 hours</h3>
              <p>
                Our support team is available Monday to Saturday, 9 AM to 6 PM
                IST
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
