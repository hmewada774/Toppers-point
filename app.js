
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import MongoStore from "connect-mongo";

// Import routes
import adminRoutes from "./routes/admin.js";
import topperRoutes from "./routes/toppers.js";
import eventRoutes from "./routes/events.js";
import contactRoutes from "./routes/contact.js";
import authRoutes from "./routes/auth.js";
import homeRoutes from "./routes/home.js";

dotenv.config();
const app = express();

// Fix __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust reverse proxy (needed on Render/Heroku/Vercel for secure cookies and correct IPs)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ✅ Path setup
const uploadsPath = path.join(__dirname, "public", "uploads");
// Local folder creation skipped on Vercel
if (!process.env.VERCEL && !fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// 🧩 Middlewares
// CORS: allow comma-separated list in CORS_ORIGINS, fallback to localhost + production domain
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5666",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5666",
  "https://topperspoint.in"
];
const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

// 🧱 Session Setup (Stored in MongoDB to prevent logout on Vercel)
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/toppers_point",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Protect direct access to admin.html before static middleware
app.get(["/admin.html", "/admin"], (req, res) => {
  if (req.session && req.session.user) {
    return res.sendFile(path.join(__dirname, "public", "admin.html"));
  }
  return res.redirect("/admin-login.html");
});

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));
// Note: Local /uploads is served as fallback, but Cloudinary URLs are absolute
app.use("/uploads", express.static(uploadsPath));

// 🌐 MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/toppers_point", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    // Don't exit process in production/vercel, just log it
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

connectDB();

// 📦 Routes
app.use("/api/toppers", topperRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/admin", adminRoutes);

// 🏠 Default route (frontend home)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🩺 Health check for uptime monitors
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

// 🚀 Start server
const PORT = process.env.PORT || 5666;

// Important for Vercel: only listen if not running as a serverless function
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
  });
}

export default app;
