import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import Logo from "../components/Logo";
import OTPInput from "../components/OTPInput";
import "../styles/Auth.css";

const ForgotPassword = () => {
  const { forgotPassword, verifyResetOTP, resetPassword, resendOTP } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Submit email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);
      setStep(2);
      showToast("OTP sent to your email! 📧", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOTPComplete = async (otp) => {
    setLoading(true);

    try {
      const response = await verifyResetOTP(email, otp);

      if (response.success) {
        setResetToken(response.data.resetToken);
        setStep(3);
        showToast("OTP verified! Create your new password 🔐", "success");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      await resendOTP(email, "reset");
      showToast("OTP resent successfully! 📧", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to resend OTP",
        "error",
      );
    }
  };

  // Step 3: Reset password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwords.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, resetToken, passwords.password);
      showToast("Password reset successful! Please login 🎉", "success");
      navigate("/login");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to reset password",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculator
  const getPasswordStrength = () => {
    const password = passwords.password;
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
      <div className="auth-container auth-container-centered">
        <div className="auth-card">
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <div className="auth-header">
                <Logo size="large" />
                <h1>Forgot Password?</h1>
                <p>No worries, we'll send you reset instructions</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="auth-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-icon">
                    <span className="icon">📧</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
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
                      Sending OTP...
                    </>
                  ) : (
                    "Send Reset OTP"
                  )}
                </button>
              </form>

              <p className="auth-footer">
                Remember your password? <Link to="/login">Back to Login</Link>
              </p>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
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

          {/* Step 3: Enter New Password */}
          {step === 3 && (
            <>
              <div className="auth-header">
                <div className="success-icon">🔐</div>
                <h1>Create New Password</h1>
                <p>Your new password must be different from previous ones</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="auth-form">
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-icon">
                    <span className="icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.password}
                      onChange={(e) =>
                        setPasswords({ ...passwords, password: e.target.value })
                      }
                      placeholder="Enter new password"
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

                {passwords.password && (
                  <div className="password-strength">
                    <div
                      className={`strength-bar ${passwordStrength.strength}`}
                    ></div>
                    <span className="strength-text">
                      {passwordStrength.text}
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-icon">
                    <span className="icon">🔒</span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
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

                {passwords.confirmPassword && (
                  <div className="password-match">
                    {passwords.password === passwords.confirmPassword ? (
                      <span className="match">✓ Passwords match</span>
                    ) : (
                      <span className="no-match">✗ Passwords don't match</span>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-loader"></span>
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
