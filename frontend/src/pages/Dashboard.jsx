import React, { useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload Image + OCR
  const handleScan = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        "http://localhost:5000/scan", // Backend OCR API
        formData
      );

      setPlate(res.data.plate); // Auto-fill detected plate
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("OCR scanning failed. Please try again.");
      setLoading(false);
    }
  };

  // Fetch vehicle details
  const handleSearch = async () => {
    if (!plate.trim()) {
      setError("Please enter a plate number.");
      return;
    }

    try {
      setError("");
      const res = await axios.get(
        `http://localhost:5000/vehicle/${plate}`
      );
      setVehicle(res.data);
    } catch (error) {
      setError("Vehicle not found in the database.");
      setVehicle(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageName(file.name);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Security Dashboard</h2>
        <p className="dashboard-subtitle">License Plate Recognition & Vehicle Verification</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-content">
        {/* Image Upload Section */}
        <div className="card">
          <h3>Step 1: Capture Vehicle Image</h3>
          
          <div className="file-upload">
            <input
              type="file"
              id="image-input"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="image-input" className="file-label">
              <span className="upload-icon">📷</span>
              <span className="upload-text">
                {imageName || "Click to upload or drag image"}
              </span>
            </label>
          </div>

          <button onClick={handleScan} className="btn-scan" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span> Scanning...
              </>
            ) : (
              "🔍 Scan Number Plate"
            )}
          </button>
        </div>

        {/* Plate Input Section */}
        <div className="card">
          <h3>Step 2: Enter/Verify Plate Number</h3>
          
          <div className="form-group">
            <label htmlFor="plate-input">License Plate Number</label>
            <input
              id="plate-input"
              type="text"
              placeholder="e.g., AB12CD3456"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="plate-input"
            />
          </div>

          <button onClick={handleSearch} className="btn-search">
            🔎 Search Vehicle
          </button>
        </div>

        {/* Vehicle Details Section */}
        {vehicle && (
          <div className="card vehicle-card">
            <h3>✓ Vehicle Information</h3>
            
            <div className="vehicle-details">
              <div className="detail-item">
                <span className="detail-label">Owner Name:</span>
                <span className="detail-value">{vehicle.name}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{vehicle.department}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-approved">✓ Approved</span>
              </div>

              <p className="security-note">
                📞 For additional information, contact Official Security Line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
