import api from "../utils/axios";

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const { data } = await api.post("/api/auth/register", userData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  // Verify email with OTP
  async verifyEmail(email, otp) {
    try {
      const { data } = await api.post("/api/auth/verify-email", { email, otp });
      if (data.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Verification failed");
    }
  },

  // Resend OTP
  async resendOTP(email, type = "verification") {
    try {
      const { data } = await api.post("/api/auth/resend-otp", { email, type });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to resend OTP");
    }
  },

  // Login user
  async login(credentials) {
    try {
      const { data } = await api.post("/api/auth/login", credentials);
      if (data.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const { data } = await api.post("/api/auth/forgot-password", { email });
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send reset email",
      );
    }
  },

  // Verify reset OTP
  async verifyResetOTP(email, otp) {
    try {
      const { data } = await api.post("/api/auth/verify-reset-otp", {
        email,
        otp,
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Invalid OTP");
    }
  },

  // Reset password
  async resetPassword(email, resetToken, password) {
    try {
      const { data } = await api.post("/api/auth/reset-password", {
        email,
        resetToken,
        password,
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data } = await api.get("/api/auth/me");
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
  },

  // Update profile
  async updateProfile(profileData) {
    try {
      const { data } = await api.put("/api/auth/profile", profileData);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const { data } = await api.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      // Clear tokens as user needs to login again
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to change password",
      );
    }
  },

  // Logout
  async logout() {
    try {
      await api.post("/api/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch (error) {
      // Still clear local data even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  },

  // Logout from all devices
  async logoutAll() {
    try {
      await api.post("/api/auth/logout-all");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  },
};
