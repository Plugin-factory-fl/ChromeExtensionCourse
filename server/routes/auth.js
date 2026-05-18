const express = require("express");
const { createUser, verifyUserPassword } = require("../db");
const { signToken, requireAuth } = require("../auth-tokens");
const { getClientUser } = require("../sync-subscription");

const router = express.Router();

function validatePassword(password) {
  if (!password || String(password).length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

router.post("/auth/register", async (req, res) => {
  try {
    const email = (req.body?.email || "").toLowerCase().trim();
    const name = (req.body?.name || "").trim();
    const password = req.body?.password || "";

    if (!email || !name) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ error: pwErr });

    await createUser({ email, name, password });
    const token = signToken(email);
    const user = await getClientUser(email, { refresh: true });

    return res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "EMAIL_EXISTS") {
      return res.status(409).json({ error: err.message });
    }
    console.error("POST /auth/register", err);
    return res.status(500).json({ error: err.message || "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const email = (req.body?.email || "").toLowerCase().trim();
    const password = req.body?.password || "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const row = await verifyUserPassword(email, password);
    if (!row) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(email);
    const user = await getClientUser(email, { refresh: true });

    return res.json({ token, user });
  } catch (err) {
    console.error("POST /auth/login", err);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await getClientUser(req.authEmail, { refresh: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    console.error("GET /auth/me", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
