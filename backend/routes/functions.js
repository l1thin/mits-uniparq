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

const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /functions/scan-plate
// Calls Supabase Edge Function for OCR
router.post("/functions/scan-plate", authMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const { SUPABASE_EDGE_FUNCTION_URL, SUPABASE_ANON_KEY } = process.env;

    if (!SUPABASE_EDGE_FUNCTION_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_EDGE_FUNCTION_URL or SUPABASE_ANON_KEY in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge function error (${response.status}):`, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return res.status(response.status).json({ error: errorJson.error || "Edge function failed" });
      } catch {
        return res.status(response.status).json({ error: "Failed to process image through edge function" });
      }
    }

    const data = await response.json();
    
    res.json({
      plate: data.plate
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
