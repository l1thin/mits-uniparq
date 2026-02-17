import React, { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const role = localStorage.getItem("role");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const getRoleDisplay = () => {
    return role === "admin" ? "Administrator" : "Security Personnel";
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>CLEARWAY</h1>
        <span className="brand-tagline">Vehicle Security System</span>
      </div>

      {role && (
        <div className="navbar-actions">
          <div className="user-info">
            <span className="user-role">{getRoleDisplay()}</span>
          </div>

          <div className="dropdown-menu">
            <button
              className="user-menu-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              👤
            </button>

            {showDropdown && (
              <div className="dropdown-content">
                <a href="#profile" className="dropdown-item">👤 Profile</a>
                <a href="#settings" className="dropdown-item">⚙️ Settings</a>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
