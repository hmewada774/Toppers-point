import express from "express";
import rateLimit from "express-rate-limit";

const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER || "Hariom";
const ADMIN_PASS = process.env.ADMIN_PASS || "Hariom@123";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, (req, res) => {
  let { username, password } = req.body || {};
  username = (username || "").trim();
  password = (password || "").trim();
  console.log("[AUTH] Login attempt:", { usernameAttempt: username });
  if (username.toLowerCase() === ADMIN_USER.toLowerCase() && password === ADMIN_PASS) {
    req.session.user = { username };
    return res.json({ success: true, message: "Logged in", redirect: "/admin" });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/me", (req, res) => {
  if (req.session?.user) return res.json({ authenticated: true, user: req.session.user });
  return res.json({ authenticated: false });
});

// Diagnostics endpoint to verify expected credentials on server
router.get("/debug", (req, res) => {
  res.json({
    adminUserConfigured: ADMIN_USER,
    usesEnv: Boolean(process.env.ADMIN_USER || process.env.ADMIN_PASS),
  });
});

export default router;


