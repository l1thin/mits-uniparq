import React, { useState } from "react";

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
    <div className="login-container">
      <h2>CLEARWAY Login</h2>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      >
        <option value="security">Security</option>
        <option value="admin">Admin</option>
      </select>

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
