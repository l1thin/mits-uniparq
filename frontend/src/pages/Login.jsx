import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [role, setRole] = useState("security");

  const handleLogin = () => {
    // Fake login (for now)
    localStorage.setItem("role", role);

    if (role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="login-wrapper">
      {/* department logo in bottom‑left; ensure file placed at public/dept-logo.png */}
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
            <label htmlFor="role-select">Select Your Role</label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-select"
            >
              <option value="security">Security Personnel</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button onClick={handleLogin} className="login-button">
            Sign In
          </button>

          <p className="login-footer">
            Demo Credentials • No password required for this demo
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
