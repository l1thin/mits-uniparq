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
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualPlate, setManualPlate] = useState("");
  const [manualPlateError, setManualPlateError] = useState("");

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

      // 3. Call scan-plate endpoint via Supabase Edge Function directly
      const { data: result, error: functionError } = await supabase.functions.invoke(
        "scan-plate",
        {
          body: { imageUrl },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || "Failed to scan plate");
      }
      if (result && result.error) {
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

  const handleSearch = async (searchPlate = plate) => {
    // If called directly from an event, searchPlate might be an Event object
    const targetPlate = typeof searchPlate === 'string' ? searchPlate : plate;
    
    if (!targetPlate.trim()) {
      setError("Please enter a plate number.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase.rpc("secure_lookup", {
        input_plate: targetPlate,
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
    } finally {
      setLoading(false);
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

          <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            {!showManualEntry ? (
              <button onClick={() => setShowManualEntry(true)} className="btn-scan" type="button" disabled={loading}>
                Enter Plate Manually
              </button>
            ) : (
              <div className="manual-entry-form">
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={manualPlate}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/\s/g, "");
                      setManualPlate(val);
                      if (manualPlateError) setManualPlateError("");
                    }}
                    placeholder="e.g. KL07AB1234"
                    className="plate-input"
                    disabled={loading}
                  />
                  {manualPlateError && (
                    <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '5px 0 0 0', textAlign: 'center' }}>
                      {manualPlateError}
                    </p>
                  )}
                </div>
                <button 
                  onClick={async () => {
                    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
                    if (!regex.test(manualPlate)) {
                      setManualPlateError("Invalid plate format. e.g. KL07AB1234");
                      return;
                    }
                    setPlate(manualPlate);
                    await handleSearch(manualPlate);
                  }} 
                  className="btn-scan" 
                  disabled={loading}
                  style={{ marginBottom: '10px' }}
                >
                  {loading ? (
                    <><span className="spinner-small"></span> Looking Up...</>
                  ) : (
                    "Look Up Vehicle"
                  )}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <span 
                    onClick={() => { setShowManualEntry(false); setManualPlateError(""); setManualPlate(""); }} 
                    style={{ cursor: 'pointer', color: '#666', fontSize: '0.9rem', textDecoration: 'underline', padding: '0.5rem' }}
                  >
                    Cancel
                  </span>
                </div>
              </div>
            )}
          </div>
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
