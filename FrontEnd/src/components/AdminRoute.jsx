import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
