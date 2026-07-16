module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "apikey": process.env.SUPABASE_ANON_KEY,
        "Authorization": authHeader
      }
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    const user = await response.json();
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid Token" });
  }
};
