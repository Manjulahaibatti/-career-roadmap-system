import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { cuteProfileAvatars } from "../../../shared/profileAvatars.js";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <div className="logo-icon" aria-hidden="true">🚀</div>
        <span>Career Roadmap System</span>
      </Link>

      <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={closeMenu}
        >
          Home
        </NavLink>
        <NavLink
          to="/careers"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={closeMenu}
        >
          Careers
        </NavLink>
        <NavLink
          to="/roadmap"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={closeMenu}
        >
          Roadmap
        </NavLink>
        <NavLink
          to="/resources"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={closeMenu}
        >
          Resources
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          onClick={closeMenu}
        >
          About Us
        </NavLink>

        {isAuthenticated && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMenu}
            >
              Profile
            </NavLink>
          </>
        )}
      </div>

      <div className="nav-buttons">
        {isAuthenticated ? (
          <div className="user-nav-group">
            <Link to="/profile" className="user-badge" title="View & Edit Profile">
              <span className="user-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" />
                ) : user?.profileAvatar ? (
                  cuteProfileAvatars.find((avatar) => avatar.id === user.profileAvatar)?.emoji || "🙂"
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : "U"
                )}
              </span>
              <span className="user-name">{user?.name?.split(" ")[0]}</span>
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/register" className="started-btn">
              Get Started
            </Link>
          </>
        )}

        <button
          className={`mobile-toggle-btn ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
