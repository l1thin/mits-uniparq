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
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanAttempted, setScanAttempted] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ---------------- CAMERA ----------------

  const startCamera = async () => {
    try {
      setCameraError("");
      setCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraLoading(false);
    } catch (err) {
      setCameraError(
        "Unable to access camera. Please check permissions and try again."
      );
      setCameraLoading(false);
    }
  };

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // ---------------- OCR SCAN ----------------

  const handleScan = async () => {
    if (!image) {
      setError("Please capture an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setScanAttempted(true);

      // 1️⃣ Upload to Supabase Storage
      const fileName = `plates/${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("plate-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("plate-images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // 2️⃣ Get JWT
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session.access_token;

      // 3️⃣ Call Edge Function
      const response = await fetch(
        process.env.REACT_APP_EDGE_FUNCTION,
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
      setError("OCR scanning failed. Please enter the plate number manually.");
      setScanFailed(true);
      setPlate("");
      setLoading(false);
    }
  };

  // ---------------- SEARCH VEHICLE ----------------

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
        name: "Registered Owner",
        department: data[0].department,
      });

    } catch (err) {
      setError("Vehicle not found in the database.");
      setVehicle(null);
    }
  };

  // ---------------- UI (UNCHANGED DESIGN) ----------------

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
                <button onClick={captureImage} className="btn-capture">
                  Capture Image
                </button>
                <button onClick={stopCamera} className="btn-cancel">
                  ✕ Cancel
                </button>
              </div>
            </>
          )}

          {image && (
            <div className="image-preview">
              <p className="image-name">✓ {imageName}</p>
              <button onClick={startCamera} className="btn-retake">
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

        {(plate || scanFailed) && (
          <div className="card">
            <h3>Verify Plate Number</h3>
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                value={plate}
                onChange={(e) =>
                  setPlate(e.target.value.toUpperCase())
                }
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
            <h3>✓ Vehicle Information</h3>
            <div className="vehicle-details">
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{vehicle.department}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-approved">
                  ✓ Approved
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
