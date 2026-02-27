// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    // Get email from localStorage or URL params
    const pendingEmail = localStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      navigate("/register");
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.verifyEmail(email, otp);

      console.log("✅ Email verified:", response);
      setSuccess(response.message);

      // Clear pending email
      localStorage.removeItem("pendingVerificationEmail");

      // Redirect to dashboard/home
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("❌ Verification error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.resendOTP(email, "verification");
      setSuccess(response.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verify-email-container">
      <h2>Verify Your Email</h2>
      <p>
        We sent a 6-digit OTP to <strong>{email}</strong>
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <button
        onClick={handleResendOTP}
        disabled={resendLoading}
        className="btn-secondary"
      >
        {resendLoading ? "Sending..." : "Resend OTP"}
      </button>
    </div>
  );
};

export default VerifyEmail;
