const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET /rest/v1/profiles?id=eq.{userId}&select=role
// Mimics Supabase PostgREST query: supabase.from("profiles").select("role").eq("id", userId).single()
router.get("/rest/v1/profiles", async (req, res) => {
  try {
    const { id, select } = req.query;

    if (id && id.startsWith("eq.")) {
      const userId = id.replace("eq.", "");
      const selectFields = select || "role";
      const fields = selectFields.split(",").map((f) => f.trim());

      const result = await pool.query(
        `SELECT ${fields.join(", ")} FROM profiles WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.json([]);
      }

      return res.json(result.rows);
    }

    // Fallback: return all profiles (admin use case)
    const result = await pool.query("SELECT * FROM profiles");
    res.json(result.rows);
  } catch (err) {
    console.error("Profiles query error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// POST /rest/v1/rpc/secure_lookup
// Mimics Supabase RPC: supabase.rpc("secure_lookup", { input_plate })
router.post("/rest/v1/rpc/secure_lookup", async (req, res) => {
  try {
    const { input_plate } = req.body;

    if (!input_plate) {
      return res.status(400).json({ error: "input_plate is required" });
    }

    const result = await pool.query(
      "SELECT full_name, department, phone FROM vehicles WHERE plate = $1",
      [input_plate.toUpperCase()]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Secure lookup error:", err);
    res.status(500).json({ error: "Lookup failed" });
  }
});

// POST /rest/v1/vehicles
// Insert a new vehicle record (admin only, auth middleware applied in server.js)
router.post("/rest/v1/vehicles", async (req, res) => {
  try {
    const { plate, full_name, department, phone } = req.body;

    if (!plate || !full_name || !department) {
      return res.status(400).json({
        error: "plate, full_name, and department are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO vehicles (plate, full_name, department, phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (plate) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           department = EXCLUDED.department,
           phone = EXCLUDED.phone
       RETURNING *`,
      [plate.toUpperCase(), full_name, department, phone || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Vehicle insert error:", err);
    res.status(500).json({ error: "Failed to insert vehicle" });
  }
});

// GET /rest/v1/vehicles
// List all vehicles (admin use case)
router.get("/rest/v1/vehicles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vehicles ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Vehicle list error:", err);
    res.status(500).json({ error: "Failed to list vehicles" });
  }
});

module.exports = router;
