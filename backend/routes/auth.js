const express = require("express");
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// POST /auth/v1/token?grant_type=password
router.post("/auth/v1/token", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        data: { session: null, user: null },
        error: "Invalid login credentials",
      });
    }

    // Call Supabase Auth API
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return res.status(authResponse.status).json({
        data: { session: null, user: null },
        error: authData.error_description || authData.msg || "Invalid login credentials",
      });
    }

    // Wrap the response so it matches what the frontend `supabaseClient.js` expects
    res.json({
      data: {
        session: {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          expires_in: authData.expires_in,
          token_type: authData.token_type,
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
        },
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      error: null,
    });
  } catch (err) {
    console.error("Auth proxy error:", err);
    res.status(500).json({
      data: { session: null, user: null },
      error: "Internal server error connecting to remote auth",
    });
  }
});

// GET /auth/v1/session
router.get("/auth/v1/session", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ data: { session: null }, error: null });
  }

  try {
    // Call Supabase to validate token and get user
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": authHeader
      }
    });

    if (!userRes.ok) {
      return res.json({ data: { session: null }, error: "Invalid token" });
    }

    const userData = await userRes.json();

    res.json({
      data: {
        session: {
          access_token: authHeader.split(" ")[1],
          user: {
            id: userData.id,
            email: userData.email,
          },
        },
      },
      error: null,
    });
  } catch (err) {
    res.json({ data: { session: null }, error: "Internal server error" });
  }
});

module.exports = router;
