import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanAttempted, setScanAttempted] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError("");
      setCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraLoading(false);
    } catch (err) {
      setCameraError(
        "Unable to access camera. Please check permissions and try again."
      );
      setCameraLoading(false);
      console.error(err);
    }
  };

  // Attach stream to video element when camera becomes active
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Capture Image from Camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "captured_image.jpg", {
          type: "image/jpeg",
        });
        setImage(file);
        setImageName("captured_image.jpg");
        stopCamera();
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Upload Image + OCR
  const handleScan = async () => {
    if (!image) {
      setError("Please capture an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setError("");
      setScanAttempted(true);

      const res = await axios.post(
        "http://localhost:5000/scan", // Backend OCR API
        formData
      );

      setPlate(res.data.plate); // Auto-fill detected plate
      setScanFailed(false);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("OCR scanning failed. Please enter the plate number manually.");
      setScanFailed(true);
      setPlate("");
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Security Dashboard</h2>
        <p className="dashboard-subtitle">License Plate Recognition & Vehicle Verification</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-content">
        {/* Camera Section */}
        <div className="card">
          <h3>Capture Vehicle Image</h3>

          {cameraError && (
            <div className="alert alert-error">{cameraError}</div>
          )}

          {!cameraActive && !image && (
            <button
              onClick={startCamera}
              className="btn-camera"
              disabled={cameraLoading}
            >
              {cameraLoading ? "Initializing Camera..." : "Take Photo"}
            </button>
          )}

          {cameraActive && (
            <>
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-feed"
                />
              </div>
              <div className="camera-controls">
                <button
                  onClick={captureImage}
                  className="btn-capture"
                >
                  Capture Image
                </button>
                <button
                  onClick={stopCamera}
                  className="btn-cancel"
                >
                  ✕ Cancel
                </button>
              </div>
            </>
          )}

          {image && (
            <div className="image-preview">
              <p className="image-name">✓ {imageName}</p>
              <button
                onClick={startCamera}
                className="btn-retake"
              >
                Retake Photo
              </button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

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

        {/* Plate Input Section - Only show if scan succeeded or if scan failed */}
        {(plate || scanFailed) && (
          <div className="card">
            {plate ? (
              <>
                <h3>Verify Plate Number</h3>
                <div className="form-group">
                  <label htmlFor="plate-input">Detected License Plate</label>
                  <input
                    id="plate-input"
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    className="plate-input"
                  />
                </div>
              </>
            ) : (
              <>
                <h3>Enter Plate Number Manually</h3>
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
              </>
            )}

            <button onClick={handleSearch} className="btn-search">
              Search Vehicle
            </button>
          </div>
        )}

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
