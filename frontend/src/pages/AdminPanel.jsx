import React, { useState } from "react";
import "./AdminPanel.css";

function AdminPanel() {
  const [vehicle, setVehicle] = useState({
    name: "",
    department: "",
    contact: "",
    plate: ""
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setVehicle({ ...vehicle, [field]: value });
  };

  const handleSubmit = () => {
    // Validate inputs
    if (!vehicle.name.trim() || !vehicle.department.trim() || !vehicle.plate.trim()) {
      setError("Please fill in all required fields.");
      setSuccess("");
      return;
    }

    setSuccess("✓ Vehicle added successfully to the system!");
    setError("");
    console.log("Vehicle added:", vehicle);

    // Reset form
    setVehicle({
      name: "",
      department: "",
      contact: "",
      plate: ""
    });

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Administrator Panel</h2>
        <p className="admin-subtitle">Register & Manage Vehicles</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-content">
        <div className="card">
          <h3>Add New Vehicle</h3>

          <div className="form-group">
            <label htmlFor="name">Owner Name *</label>
            <input
              id="name"
              type="text"
              placeholder="Enter full name"
              value={vehicle.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <input
              id="department"
              type="text"
              placeholder="e.g., Security, Administration"
              value={vehicle.department}
              onChange={(e) => handleChange("department", e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Number</label>
            <input
              id="contact"
              type="text"
              placeholder="Optional: 10-digit number"
              value={vehicle.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="plate">Vehicle Plate Number *</label>
            <input
              id="plate"
              type="text"
              placeholder="e.g., AB12CD3456"
              value={vehicle.plate}
              onChange={(e) => handleChange("plate", e.target.value.toUpperCase())}
              className="admin-input plate-input"
            />
          </div>

          <button onClick={handleSubmit} className="btn-submit">
            ➕ Add Vehicle
          </button>
        </div>

        <div className="card info-card">
          <h3>System Information</h3>
          <div className="info-section">
            <p className="info-title">📋 Registration Guidelines</p>
            <ul className="info-list">
              <li>All fields marked with * are mandatory</li>
              <li>Vehicle plates should be in uppercase</li>
              <li>Contact numbers are kept confidential</li>
              <li>Registered vehicles appear in Security Dashboard</li>
            </ul>
          </div>

          <div className="info-section">
            <p className="info-title">🔒 Security Notes</p>
            <ul className="info-list">
              <li>Only authenticated admins can register vehicles</li>
              <li>All entries are logged and audited</li>
              <li>Changes are recorded with timestamps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
