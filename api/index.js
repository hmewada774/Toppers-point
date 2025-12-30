// Vercel serverless function entry point
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import MongoStore from "connect-mongo";

// Import routes
import adminRoutes from "../routes/admin.js";
import topperRoutes from "../routes/toppers.js";
import eventRoutes from "../routes/events.js";
import contactRoutes from "../routes/contact.js";
import authRoutes from "../routes/auth.js";
import homeRoutes from "../routes/home.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Basic middleware
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

// MongoDB connection cache
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }

    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        throw new Error("MONGO_URI environment variable is not set");
    }

    mongoose.set('strictQuery', false);

    const db = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });

    cachedDb = db;
    console.log("✅ MongoDB Connected");
    return db;
}

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 8,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    },
};

// Add MongoStore if MONGO_URI is available
if (process.env.MONGO_URI) {
    sessionConfig.store = MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60,
        touchAfter: 24 * 3600,
    });
}

app.use(session(sessionConfig));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Database connection middleware for API routes
app.use(['/api', '/admin'], async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        console.error("Database connection error:", err);
        res.status(500).json({
            error: "Database connection failed",
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// Admin route protection
app.get(["/admin.html", "/admin"], (req, res) => {
    if (req.session?.user) {
        return res.sendFile(path.join(__dirname, "../public/admin.html"));
    }
    return res.redirect("/admin-login.html");
});

// API Routes
app.use("/api/toppers", topperRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/admin", adminRoutes);

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Health check
app.get("/healthz", (req, res) => {
    res.json({
        ok: true,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Export for Vercel
export default app;
