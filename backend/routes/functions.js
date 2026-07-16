const express = require("express");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for local file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /functions/scan-plate
// Mock OCR endpoint — receives an image, returns a static plate number
router.post("/functions/scan-plate", authMiddleware, upload.single("image"), (req, res) => {
  try {
    let imageUrl = null;

    // Handle both multipart form data and JSON body
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body && req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    // Mock OCR result — returns a static plate number >= 6 chars
    const mockPlate = "KL07CD1234";

    res.json({
      plate: mockPlate,
      result: null,
    });
  } catch (err) {
    console.error("Scan plate error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /storage/upload — local file upload mock
// Mimics Supabase storage upload
router.post("/storage/upload", authMiddleware, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;
    res.json({
      data: { path: filePath },
      error: null,
    });
  } catch (err) {
    console.error("Storage upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// GET /storage/public-url — returns the public URL for a file
router.get("/storage/public-url", (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: "path query param required" });
  }

  const baseUrl = req.query.baseUrl || `${req.protocol}://${req.get("host")}`;
  res.json({
    data: { publicUrl: `${baseUrl}${filePath}` },
    error: null,
  });
});

module.exports = router;
