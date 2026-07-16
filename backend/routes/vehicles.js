const express = require("express");
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Generic Proxy for all /rest/v1/* requests
const forwardToSupabase = async (req, res, path) => {
  try {
    const url = new URL(`${SUPABASE_URL}${path}`);
    
    // Forward query params
    for (const [key, val] of Object.entries(req.query)) {
      url.searchParams.append(key, val);
    }
    
    const headers = {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };
    
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    } else {
      headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    const options = {
      method: req.method,
      headers: headers
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url.toString(), options);
    const text = await response.text();
    
    if (text) {
      try {
        res.status(response.status).json(JSON.parse(text));
      } catch(e) {
        res.status(response.status).send(text);
      }
    } else {
      res.status(response.status).send();
    }
  } catch (err) {
    console.error(`Supabase Proxy Error on ${path}:`, err);
    res.status(500).json({ error: "Failed to communicate with remote database" });
  }
};

// Intercept the secure_lookup RPC and translate it to a standard REST query
router.post("/rest/v1/rpc/secure_lookup", async (req, res) => {
  try {
    const { input_plate } = req.body;
    if (!input_plate) return res.status(400).json({ error: "Missing input_plate" });

    // Translate to a standard GET on the vehicles table
    const url = new URL(`${SUPABASE_URL}/rest/v1/vehicles`);
    url.searchParams.append("plate", `eq.${input_plate.toUpperCase()}`);
    url.searchParams.append("select", "full_name,department,phone");

    const headers = {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };

    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    } else {
      headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    console.log("Interceptor sending GET to:", url.toString());
    console.log("With headers:", headers);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: headers
    });

    console.log("Supabase response status:", response.status);
    const text = await response.text();
    console.log("Supabase response text:", text);

    if (text) {
      try {
        res.status(response.status).json(JSON.parse(text));
      } catch(e) {
        res.status(response.status).send(text);
      }
    } else {
      res.status(response.status).send();
    }
  } catch (err) {
    console.error("Secure lookup error:", err);
    res.status(500).json({ error: "Failed to perform secure lookup" });
  }
});

// Map all REST requests directly to Supabase PostgREST API
router.all(/^\/rest\/v1\/.*/, (req, res) => {
  forwardToSupabase(req, res, req.path);
});

module.exports = router;
