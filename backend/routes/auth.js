const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// POST /auth/v1/token?grant_type=password
// Mimics Supabase signInWithPassword — returns a session object
router.post("/auth/v1/token", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        data: { session: null, user: null },
        error: "Invalid login credentials",
      });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash, role FROM profiles WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        data: { session: null, user: null },
        error: "Invalid login credentials",
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        data: { session: null, user: null },
        error: "Invalid login credentials",
      });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      data: {
        session: {
          access_token: token,
          refresh_token: "mock-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        user: {
          id: user.id,
          email: user.email,
        },
      },
      error: null,
    });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({
      data: { session: null, user: null },
      error: "Internal server error",
    });
  }
});

// GET /auth/v1/session
// Returns the current session from the JWT in the Authorization header
router.get("/auth/v1/session", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ data: { session: null }, error: null });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      data: {
        session: {
          access_token: token,
          user: {
            id: decoded.sub,
            email: decoded.email,
          },
        },
      },
      error: null,
    });
  } catch (err) {
    res.json({ data: { session: null }, error: "Invalid token" });
  }
});

module.exports = router;
