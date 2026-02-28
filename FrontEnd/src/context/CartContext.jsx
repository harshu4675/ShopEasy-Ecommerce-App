import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../utils/api";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const response = await api.get("/cart");
      const count = response.data?.items?.length || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const updateCartCount = (count) => {
    setCartCount(count);
  };

  const refreshCart = () => {
    fetchCartCount();
  };

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
