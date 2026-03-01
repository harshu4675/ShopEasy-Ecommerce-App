import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Logo from "../components/Logo";
import OTPInput from "../components/OTPInput";
import "../styles/Auth.css";

const Register = () => {
  const { register, verifyEmail, resendOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast("Please enter your name", "error");
      return false;
    }

    if (!formData.email.trim()) {
      showToast("Please enter your email", "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email", "error");
      return false;
    }

    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return false;
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return false;
    }

    if (!agreedToTerms) {
      showToast("Please agree to the Terms & Conditions", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
      );

      if (response.success) {
        setEmail(formData.email);
        setStep(2);
        showToast("OTP sent to your email! 📧", "success");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Registration failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp) => {
    setLoading(true);

    try {
      const response = await verifyEmail(email, otp);

      if (response.success) {
        showToast("Account verified successfully! 🎉", "success");
        navigate("/");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(email, "verification");
      showToast("OTP resent successfully! 📧", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to resend OTP",
        "error",
      );
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: "", text: "" };
    if (password.length < 4) return { strength: "weak", text: "Weak" };
    if (password.length < 6) return { strength: "medium", text: "Medium" };
    if (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { strength: "strong", text: "Strong" };
    }
    return { strength: "medium", text: "Medium" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Features Section */}
        <div className="auth-features">
          <div className="features-content">
            <div className="features-icon">🎉</div>
            <h2>Member Benefits</h2>
            <p className="features-subtitle">
              Create an account and unlock exclusive perks
            </p>
            <ul>
              <li>
                <span className="feature-icon">💰</span>
                <div className="feature-text">
                  <strong>₹100 Welcome Bonus</strong>
                  <span>Get ₹100 off on your first order</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">🎟️</span>
                <div className="feature-text">
                  <strong>Exclusive Coupons</strong>
                  <span>Access to member-only deals</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">📦</span>
                <div className="feature-text">
                  <strong>Order Tracking</strong>
                  <span>Track your orders in real-time</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">♡</span>
                <div className="feature-text">
                  <strong>Wishlist</strong>
                  <span>Save items for later</span>
                </div>
              </li>
              <li></li>
            </ul>
          </div>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {step === 1 ? (
            <>
              <div className="auth-header">
                <Logo size="large" />
                <h1>Create Account</h1>
                <p>Join ShopEasy for exclusive deals</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-icon">
                      <span className="icon">👤</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Phone Number <span className="optional"></span>
                    </label>
                    <div className="input-icon">
                      <span className="icon">📱</span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit number"
                        maxLength="10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-icon">
                    <span className="icon">📧</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-icon">
                      <span className="icon">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                        required
                        minLength="6"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-icon">
                      <span className="icon">🔒</span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {formData.password && (
                  <div className="password-strength">
                    <div
                      className={`strength-bar ${passwordStrength.strength}`}
                    ></div>
                    <span className="strength-text">
                      {passwordStrength.text}
                    </span>
                  </div>
                )}

                <div className="form-options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      disabled={loading}
                    />
                    <span>
                      I agree to the <Link to="/terms">Terms & Conditions</Link>{" "}
                      and <Link to="/privacy">Privacy Policy</Link>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-loader"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="auth-footer">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </>
          ) : (
            <>
              <button
                className="back-btn"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </button>
              <OTPInput
                length={6}
                email={email}
                onComplete={handleOTPComplete}
                onResend={handleResendOTP}
                loading={loading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
