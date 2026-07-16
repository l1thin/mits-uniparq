require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const functionRoutes = require("./routes/functions");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 54321;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ──────────────────────────────────────────────────
// Supabase-compatible API routes
// ──────────────────────────────────────────────────

// Auth endpoints (no auth required)
app.use("/", authRoutes);

// Vehicle / Profile endpoints (auth required)
app.use("/", authMiddleware, vehicleRoutes);

// Functions / Storage endpoints (auth handled inside)
app.use("/", functionRoutes);

// ──────────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`UniParQ backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
