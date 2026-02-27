import React, { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    console.log("🔍 Checking Auth...");
    console.log("Token exists:", !!token);
    console.log("Saved user:", savedUser ? JSON.parse(savedUser) : null);

    if (token && savedUser) {
      try {
        // Verify token is still valid
        const response = await api.get("/auth/me");
        console.log("✅ /auth/me response:", response.data);

        // ✅ FIX: Access user correctly from nested structure
        const userData =
          response.data.data?.user || response.data.user || response.data.data;

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.error("❌ No user data in response:", response.data);
          clearAuth();
        }
      } catch (error) {
        console.log("❌ Token validation failed:", error.response?.data);
        // Try to refresh token
        try {
          const refreshResponse = await api.post("/auth/refresh-token");
          if (refreshResponse.data.success) {
            localStorage.setItem(
              "accessToken",
              refreshResponse.data.data.accessToken,
            );
            // Try getting user again
            const meResponse = await api.get("/auth/me");
            const userData =
              meResponse.data.data?.user ||
              meResponse.data.user ||
              meResponse.data.data;

            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              clearAuth();
            }
          }
        } catch (refreshError) {
          console.log("❌ Refresh failed, clearing auth...");
          clearAuth();
        }
      }
    }
    setLoading(false);
  };
  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Register - Step 1: Send OTP
  const register = async (name, email, password, phone) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
    });
    return response.data;
  };

  // Verify Email OTP - Step 2
  const verifyEmail = async (email, otp) => {
    const response = await api.post("/auth/verify-email", { email, otp });

    if (response.data.success && response.data.data) {
      const { user: userData, accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    }

    return response.data;
  };

  // Resend OTP
  const resendOTP = async (email, type = "verification") => {
    const response = await api.post("/auth/resend-otp", { email, type });
    return response.data;
  };

  // Login
  const login = async (email, password, rememberMe = false) => {
    const response = await api.post("/auth/login", {
      email,
      password,
      rememberMe,
    });

    if (response.data.success && response.data.data) {
      const { user: userData, accessToken } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setUser(userData);
      setIsAuthenticated(true);
    }

    return response.data;
  };

  // Forgot Password - Send OTP
  const forgotPassword = async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  };

  // Verify Reset OTP
  const verifyResetOTP = async (email, otp) => {
    const response = await api.post("/auth/verify-reset-otp", { email, otp });
    return response.data;
  };

  // Reset Password
  const resetPassword = async (email, resetToken, password) => {
    const response = await api.post("/auth/reset-password", {
      email,
      resetToken,
      password,
    });
    return response.data;
  };

  // Change Password (when logged in)
  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const response = await api.put("/auth/update-profile", profileData);

    if (response.data.success && response.data.data) {
      const updatedUser = response.data.data.user || response.data.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return response.data;
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  }, []);

  // Update user in context (for external updates)
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Get remembered email
  const getRememberedEmail = () => {
    return localStorage.getItem("rememberedEmail") || "";
  };

  // Context value
  const value = {
    // State
    user,
    loading,
    isAuthenticated,

    // Auth methods
    register,
    verifyEmail,
    resendOTP,
    login,
    logout,

    // Password methods
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    changePassword,

    // Profile methods
    updateProfile,
    updateUser,

    // Utils
    checkAuth,
    getRememberedEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
