import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Logo from "../components/Logo";
import OTPInput from "../components/OTPInput";
import "../styles/Auth.css";

const Login = () => {
  const { login, verifyEmail, resendOTP } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1); // 1: Login, 2: OTP (if not verified)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await login(
        formData.email,
        formData.password,
        rememberMe,
      );

      if (response.success) {
        showToast("Welcome back! 🎉", "success");
        navigate(from, { replace: true });
      }
    } catch (error) {
      const errorData = error.response?.data;

      // Handle unverified email
      if (errorData?.data?.requiresVerification) {
        setStep(2);
        showToast("Please verify your email. OTP sent! 📧", "info");
      } else {
        showToast(errorData?.message || "Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp) => {
    setLoading(true);

    try {
      const response = await verifyEmail(formData.email, otp);

      if (response.success) {
        showToast("Email verified! Welcome! 🎉", "success");
        navigate(from, { replace: true });
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(formData.email, "verification");
      showToast("OTP resent successfully! 📧", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to resend OTP",
        "error",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Features Section */}
        <div className="auth-features">
          <div className="features-content">
            <div className="features-icon">🛍️</div>
            <h2>Why Shop with Us?</h2>
            <p className="features-subtitle">
              Join thousands of happy customers
            </p>
            <ul>
              <li>
                <span className="feature-icon">✨</span>
                <div className="feature-text">
                  <strong>Latest Fashion Trends</strong>
                  <span>Curated collections updated weekly</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">🚚</span>
                <div className="feature-text">
                  <strong>Free Delivery</strong>
                  <span>On orders above ₹199</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">↩️</span>
                <div className="feature-text">
                  <strong>Easy Returns</strong>
                  <span>7-day hassle-free returns</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">💳</span>
                <div className="feature-text">
                  <strong>Secure Payments</strong>
                  <span>100% secure transactions</span>
                </div>
              </li>
              <li>
                <span className="feature-icon">🎁</span>
                <div className="feature-text">
                  <strong>Member Discounts</strong>
                  <span>Exclusive deals for members</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {step === 1 ? (
            <>
              <div className="auth-header">
                <Logo size="large" />
                <h1>Welcome Back!</h1>
                <p>Login to continue shopping</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
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

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-icon">
                    <span className="icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
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

                <div className="form-options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-loader"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <p className="auth-footer">
                Don't have an account?{" "}
                <Link to="/register">Create Account</Link>
              </p>
            </>
          ) : (
            <>
              <button
                className="back-btn"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back to Login
              </button>
              <OTPInput
                length={6}
                email={formData.email}
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

export default Login;
