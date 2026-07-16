import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "./AdminPanel.css";

function AdminPanel() {
  const [vehicle, setVehicle] = useState({
    name: "",
    department: "",
    contact: "",
    plate: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setVehicle({ ...vehicle, [field]: value });
  };

  const handleSubmit = async () => {
    if (!vehicle.name.trim() || !vehicle.department.trim() || !vehicle.plate.trim()) {
      setError("Please fill in all required fields.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const { error: insertError } = await supabase
        .from("vehicles")
        .insert({
          plate: vehicle.plate.toUpperCase(),
          full_name: vehicle.name,
          department: vehicle.department,
          phone: vehicle.contact || null,
        });

      if (insertError) {
        throw new Error(insertError.message || "Failed to add vehicle");
      }

      setSuccess("Vehicle added successfully to the system!");

      setVehicle({
        name: "",
        department: "",
        contact: "",
        plate: "",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
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

          <button onClick={handleSubmit} className="btn-submit" disabled={saving}>
            {saving ? "Adding..." : "Add Vehicle"}
          </button>
        </div>

        <div className="card info-card">
          <h3>System Information</h3>
          <div className="info-section">
            <p className="info-title">Registration Guidelines</p>
            <ul className="info-list">
              <li>All fields marked with * are mandatory</li>
              <li>Vehicle plates should be in uppercase</li>
              <li>Contact numbers are kept confidential</li>
              <li>Registered vehicles appear in Security Dashboard</li>
            </ul>
          </div>

          <div className="info-section">
            <p className="info-title">Security Notes</p>
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
