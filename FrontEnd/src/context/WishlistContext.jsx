import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../utils/api";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlistCount = async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await api.get("/wishlist");
      const count = response.data?.products?.length || 0;
      setWishlistCount(count);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchWishlistCount();
  }, [user]);

  const updateWishlistCount = (count) => {
    setWishlistCount(count);
  };

  const refreshWishlist = () => {
    fetchWishlistCount();
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistCount, updateWishlistCount, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
