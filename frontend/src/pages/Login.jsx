import React, { useState } from "react";
import "./Login.css";
import { supabase } from "../supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="login-wrapper">
      <img
        src="/dept-logo.png"
        alt="Department Logo"
        className="dept-logo"
      />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>UniParQ</h1>
            <p className="login-subtitle">Vehicle Clearance System</p>
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

          <button onClick={handleLogin} className="login-button">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
