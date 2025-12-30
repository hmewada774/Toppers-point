// Minimal Vercel serverless function for debugging
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Vercel serverless function is working!",
        timestamp: new Date().toISOString(),
        env: {
            hasMongoUri: !!process.env.MONGO_URI,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

app.get("/healthz", (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Catch all other routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found", path: req.path });
});

export default app;
