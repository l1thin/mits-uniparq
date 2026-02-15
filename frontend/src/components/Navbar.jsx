import React from "react";

function Navbar() {
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="navbar">
      <h1>CLEARWAY</h1>

      {role && <button onClick={handleLogout}>Logout</button>}
    </div>
  );
}

export default Navbar;
