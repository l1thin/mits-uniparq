import React, { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [image, setImage] = useState(null);
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  // Upload Image + OCR
  const handleScan = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/scan", // Backend OCR API
        formData
      );

      setPlate(res.data.plate); // Auto-fill detected plate
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("OCR Failed");
      setLoading(false);
    }
  };

  // Fetch vehicle details
  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/vehicle/${plate}`
      );
      setVehicle(res.data);
    } catch (error) {
      alert("Vehicle Not Found");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Security Dashboard</h2>

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={handleScan}>
        {loading ? "Scanning..." : "Scan Number Plate"}
      </button>

      {/* Manual / Auto Plate Input */}
      <input
        placeholder="Detected Plate Number"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
      />

      <button onClick={handleSearch}>Search Vehicle</button>

      {/* Vehicle Details */}
      {vehicle && (
        <div className="vehicle-card">
          <h3>Owner Details</h3>
          <p><b>Name:</b> {vehicle.name}</p>
          <p><b>Department:</b> {vehicle.department}</p>
          <p><b>Contact:</b> Hidden (Use Official Security Line)</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
