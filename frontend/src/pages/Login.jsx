import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { supabase } from "../supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async () => {
    if (rememberMe) {
      window.localStorage.setItem('remember_me', 'true');
    } else {
      window.localStorage.removeItem('remember_me');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="login-wrapper">
      <img
        src={process.env.PUBLIC_URL + "/dept-logo.png"}
        alt="Department Logo"
        className="dept-logo"
      />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>MPMS</h1>
            <p className="login-subtitle">Mits Parking Management System</p>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="role-select"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="role-select"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <button onClick={handleLogin} className="login-button">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
