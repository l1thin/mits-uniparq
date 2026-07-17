import React, { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/logo-3.png" alt="University Logo" className="navbar-univ-logo" />

        <div className="navbar-actions">
          {isLoggedIn && (
            <>
              <div className="dropdown-menu">
                <button
                  className="user-menu-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  &#128100;
                </button>

                {showDropdown && (
                  <div className="dropdown-content">
                    <a href="#profile" className="dropdown-item">Profile</a>
                    <a href="#settings" className="dropdown-item">Settings</a>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="navbar-title">
        <h1>UniParQ</h1>
        <span className="brand-tagline">Vehicle Security System</span>
      </div>

      <div className="right-group">
        <img src="/dept-logo.png" alt="Department Logo" className="navbar-dept-logo" />
      </div>
    </nav>
  );
}

export default Navbar;
