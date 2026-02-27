import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import Logo from "./Logo";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Safe user name getter
  const getUserName = () => {
    if (!user) return "";
    return user.name || user.email?.split("@")[0] || "User";
  };

  // Safe user initial getter
  const getUserInitial = () => {
    const name = getUserName();
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Safe first name getter
  const getFirstName = () => {
    const name = getUserName();
    return name ? name.split(" ")[0] : "User";
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setMenuOpen(false);
      setUserMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <ul className="nav-links-desktop">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/products">Shop</Link>
          </li>
          <li className="nav-dropdown">
            <span>Categories ▾</span>
            <div className="dropdown-menu">
              <Link to="/products?category=Men's Clothing">Men's Fashion</Link>
              <Link to="/products?category=Women's Clothing">
                Women's Fashion
              </Link>
              <Link to="/products?category=Kids' Clothing">Kids' Wear</Link>
              <Link to="/products?category=Perfumes">Perfumes</Link>
              <Link to="/products?category=Watches">Watches</Link>
              <Link to="/products?category=Sunglasses">Sunglasses</Link>
              <Link to="/products?category=Bags & Wallets">Bags & Wallets</Link>
              <Link to="/products?category=Jewelry">Jewelry</Link>
              <Link to="/products?category=Footwear">Footwear</Link>
              <Link to="/products?category=Accessories">Accessories</Link>
            </div>
          </li>
          <li>
            <Link to="/coupons">Offers</Link>
          </li>
        </ul>

        {/* Search Bar - Desktop */}
        <div className="search-bar-desktop">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </form>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Mobile Search Toggle */}
          <button
            className="search-toggle-mobile"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            🔍
          </button>

          {user ? (
            <>
              <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
                <span className="nav-icon">♡</span>
                <span className="nav-icon-label">Wishlist</span>
              </Link>

              <Link to="/cart" className="nav-icon-btn" title="Cart">
                <span className="nav-icon">🛒</span>
                <span className="nav-icon-label">Cart</span>
              </Link>

              <Link
                to="/notifications"
                className="nav-icon-btn notification-btn"
                title="Notifications"
              >
                <span className="nav-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              <div className="user-menu-desktop">
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="user-avatar-small">{getUserInitial()}</div>
                  <span className="user-name-desktop">{getFirstName()}</span>
                  <span className="dropdown-arrow">▾</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="user-dropdown-overlay"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <div className="user-avatar-large">
                          {getUserInitial()}
                        </div>
                        <div>
                          <p className="user-dropdown-name">{getUserName()}</p>
                          <p className="user-dropdown-email">
                            {user.email || ""}
                          </p>
                        </div>
                      </div>
                      <div className="user-dropdown-links">
                        <Link
                          to="/my-orders"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          📦 My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          ♡ Wishlist
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          🔔 Notifications
                        </Link>
                        {user.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="admin-link"
                          >
                            ⚙️ Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="user-dropdown-footer">
                        <button onClick={handleLogout} className="logout-btn">
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons-desktop">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
            <span className={menuOpen ? "active" : ""}></span>
            <span className={menuOpen ? "active" : ""}></span>
            <span className={menuOpen ? "active" : ""}></span>
          </button>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="search-bar-mobile">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit">🔍</button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="close-search"
              >
                ✕
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          <div className="mobile-menu-header">
            <Logo size="small" />
            <button className="close-menu" onClick={closeMenu}>
              ✕
            </button>
          </div>

          <ul className="mobile-nav-links">
            <li>
              <Link to="/" onClick={closeMenu}>
                🏠 Home
              </Link>
            </li>
            <li>
              <Link to="/products" onClick={closeMenu}>
                🛍️ Shop All
              </Link>
            </li>
            <li>
              <Link to="/products?category=Men's Clothing" onClick={closeMenu}>
                👔 Men's Fashion
              </Link>
            </li>
            <li>
              <Link
                to="/products?category=Women's Clothing"
                onClick={closeMenu}
              >
                👗 Women's Fashion
              </Link>
            </li>
            <li>
              <Link to="/products?category=Kids' Clothing" onClick={closeMenu}>
                👶 Kids' Wear
              </Link>
            </li>
            <li>
              <Link to="/products?category=Perfumes" onClick={closeMenu}>
                🌸 Perfumes
              </Link>
            </li>
            <li>
              <Link to="/products?category=Accessories" onClick={closeMenu}>
                💍 Accessories
              </Link>
            </li>
            <li>
              <Link to="/coupons" onClick={closeMenu}>
                🎟️ Offers
              </Link>
            </li>
          </ul>

          <div className="mobile-menu-divider"></div>

          {user ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">{getUserInitial()}</div>
                <div>
                  <p className="mobile-user-name">{getUserName()}</p>
                  <p className="mobile-user-email">{user.email || ""}</p>
                </div>
              </div>

              <ul className="mobile-user-links">
                <li>
                  <Link to="/my-orders" onClick={closeMenu}>
                    📦 My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" onClick={closeMenu}>
                    ♡ Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/cart" onClick={closeMenu}>
                    🛒 Cart
                  </Link>
                </li>
                <li>
                  <Link to="/notifications" onClick={closeMenu}>
                    🔔 Notifications
                  </Link>
                </li>

                {user.role === "admin" && (
                  <li className="mobile-admin-link">
                    <Link to="/admin/dashboard" onClick={closeMenu}>
                      ⚙️ Admin Dashboard
                    </Link>
                  </li>
                )}

                <li>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link
                to="/login"
                className="btn btn-outline btn-block"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-block"
                onClick={closeMenu}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMenu}></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
