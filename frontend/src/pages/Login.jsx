import React, { useState } from "react";
import "./Login.css";
import { supabase } from "../supabaseClient";

function Login() {
  const [role, setRole] = useState("security");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // 1️⃣ Login using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user.id;

    // 2️⃣ Fetch role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      alert("Role not found");
      return;
    }

    // 3️⃣ Check if selected role matches DB role
    if (profile.role !== role) {
      alert("Incorrect role selected");
      return;
    }

    // 4️⃣ Redirect based on role
    if (profile.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
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

          {/* 🔹 Added email & password inputs (logic only, no design changes) */}
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
            Use real Supabase credentials
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
