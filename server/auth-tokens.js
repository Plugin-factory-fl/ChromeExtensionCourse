const jwt = require("jsonwebtoken");

const TOKEN_TTL = "30d";

function getSecret() {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret || "dev-only-change-me";
}

function signToken(email) {
  return jwt.sign({ email: email.toLowerCase().trim() }, getSecret(), { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, getSecret());
    return payload.email ? payload.email.toLowerCase().trim() : null;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const email = verifyToken(token);
  if (!email) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  req.authEmail = email;
  next();
}

module.exports = { signToken, verifyToken, requireAuth };
