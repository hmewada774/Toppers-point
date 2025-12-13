import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import session from "express-session";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import csrf from "csurf";

dotenv.config();
const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: false }));
app.use(express.json());

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // We'll apply our own CSP below to allow current inline/CDN usage
}));

// Baseline CSP (tuned to current app usage)
app.use((req, res, next) => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// Compression
app.use(compression());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "toppers-point-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    },
  })
);

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/auth', authLimiter);
app.use(['/admin', '/api'], apiLimiter);

// CSRF protection for admin routes (session-based tokens)
const csrfProtection = csrf({ cookie: false });

// Protect direct access to admin.html before static middleware
app.get("/admin.html", (req, res) => {
  if (req.session && req.session.user) {
    return res.sendFile(process.cwd() + "/public/admin.html");
  }
  return res.redirect("/admin-login.html");
});

// CSRF token endpoint for admin UI
app.get('/admin/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Enhanced static file serving with logging
const staticOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  etag: true,
  setHeaders: (res, path) => {
    // Add cache control for CSS and JS files
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.set('Cache-Control', 'public, max-age=0');
    }
  }
};

// Serve static files with logging middleware
app.use((req, res, next) => {
  console.log(`Request for: ${req.originalUrl}`);
  next();
});

app.use(express.static("public", staticOptions));

// Route to test if CSS files are being served
app.get('/test-css', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CSS Test</title>
      <link rel="stylesheet" href="/css/index.css">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-box { 
          width: 200px; 
          height: 100px; 
          background-color: #4CAF50; 
          color: white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin: 20px 0;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <h1>CSS Test Page</h1>
      <p>If you see a green box below, basic CSS is working:</p>
      <div class="test-box">CSS is working!</div>
      <p>If the box above is not green, there might be an issue with the CSS file loading.</p>
      <p>Try opening the CSS file directly: <a href="/css/index.css" target="_blank">/css/index.css</a></p>
    </body>
    </html>
  `);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error: ", err));

import topperRoutes from "./routes/toppers.js";
import eventRoutes from "./routes/events.js";
import contactRoutes from "./routes/contact.js";
import homeRoutes from "./routes/home.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";

app.use("/api/toppers", topperRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/admin", csrfProtection, adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
