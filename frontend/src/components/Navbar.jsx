import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Navbar.css";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

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
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={process.env.PUBLIC_URL + "/logo-3.png"} alt="University Logo" className="navbar-univ-logo" />
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
                    <button onClick={handleLogout} className="dropdown-item logout">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <img src={process.env.PUBLIC_URL + "/dept-logo.png"} alt="Department Logo" className="navbar-dept-logo" />
      </div>
    </nav>
  );
}

export default Navbar;
