import React, { useState } from "react";

function AdminPanel() {
  const [vehicle, setVehicle] = useState({
    name: "",
    department: "",
    contact: "",
    plate: ""
  });

  const handleSubmit = () => {
    alert("Vehicle Added Successfully!");
    console.log(vehicle);
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>

      <input
        placeholder="Owner Name"
        onChange={(e) =>
          setVehicle({ ...vehicle, name: e.target.value })
        }
      />

      <input
        placeholder="Department"
        onChange={(e) =>
          setVehicle({ ...vehicle, department: e.target.value })
        }
      />

      <input
        placeholder="Contact Number"
        onChange={(e) =>
          setVehicle({ ...vehicle, contact: e.target.value })
        }
      />

      <input
        placeholder="Vehicle Plate"
        onChange={(e) =>
          setVehicle({ ...vehicle, plate: e.target.value })
        }
      />

      <button onClick={handleSubmit}>Add Vehicle</button>
    </div>
  );
}

export default AdminPanel;
