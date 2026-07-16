import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

function Dashboard() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanAttempted, setScanAttempted] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageName(file.name);
    }
  };

  const handleScan = async () => {
    if (!image) {
      setError("Please capture an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setScanAttempted(true);

      // 1. Upload image to Supabase Storage
      const fileName = `plates/${Date.now()}-${image.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("plate-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      // 2. Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from("plate-images")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // 3. Get JWT from session
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session.access_token;

      // 4. Call scan-plate endpoint with JSON
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:54321";
      const response = await fetch(
        API_URL + "/functions/scan-plate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setPlate(result.plate);
      setScanFailed(false);
      setLoading(false);
    } catch (err) {
      setError(`OCR Error: ${err.message}. Please enter the plate number manually.`);
      setScanFailed(true);
      setPlate("");
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!plate.trim()) {
      setError("Please enter a plate number.");
      return;
    }

    try {
      setError("");

      const { data, error } = await supabase.rpc("secure_lookup", {
        input_plate: plate,
      });

      if (error || !data || data.length === 0) {
        throw new Error("Vehicle not found");
      }

      setVehicle({
        name: data[0].full_name,
        department: data[0].department,
        phone: data[0].phone,
      });
    } catch (err) {
      setError("Vehicle not found in the database.");
      setVehicle(null);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Security Dashboard</h2>
        <p className="dashboard-subtitle">
          License Plate Recognition & Vehicle Verification
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-content">
        <div className="card">
          <h3>Capture Vehicle Image</h3>

          {!image && (
            <div className="upload-container" style={{ margin: "20px 0", textAlign: "center" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="file-upload"
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="btn-camera" style={{ display: 'inline-block', cursor: 'pointer', margin: 0 }}>
                Upload Photo
              </label>
            </div>
          )}

          {image && (
            <div className="image-preview">
              <p className="image-name">{"\u2713"} {imageName}</p>
              <div className="upload-container" style={{ marginTop: "15px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="file-reupload"
                  style={{ display: "none" }}
                />
                <label htmlFor="file-reupload" className="btn-retake" style={{ display: 'inline-block', cursor: 'pointer', margin: 0 }}>
                  Upload Different Photo
                </label>
              </div>
            </div>
          )}

          <button onClick={handleScan} className="btn-scan" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span> Scanning...
              </>
            ) : (
              "Scan Number Plate"
            )}
          </button>
        </div>

        {(plate || scanFailed) && (
          <div className="card">
            <h3>Verify Plate Number</h3>
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="plate-input"
              />
            </div>
            <button onClick={handleSearch} className="btn-search">
              Search Vehicle
            </button>
          </div>
        )}

        {vehicle && (
          <div className="card vehicle-card">
            <h3>{"\u2713"} Vehicle Information</h3>

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
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{vehicle.phone}</span>
              </div>

              <p className="security-note">
                For additional information, contact Official Security Line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
