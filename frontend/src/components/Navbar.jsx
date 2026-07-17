import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Navbar.css";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem("remember_me");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/logo-3.png" alt="University Logo" className="navbar-univ-logo" />
      </div>

      <div className="navbar-title">
        <h1>UniParQ</h1>
        <span className="brand-tagline">Vehicle Security System</span>
      </div>

      <div className="right-group">
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
        <img src="/dept-logo.png" alt="Department Logo" className="navbar-dept-logo" />
      </div>
    </nav>
  );
}

export default Navbar;
