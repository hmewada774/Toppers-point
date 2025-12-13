import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Topper from "../models/Topper.js";
import Event from "../models/Event.js";
import Faculty from "../models/Faculty.js";
import Founder from "../models/Founder.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pub = path.join(__dirname, "../public");
const folders = {
  pamphlets: path.join(pub, "uploads/pamphlets"),
  faculty: path.join(pub, "uploads/faculty"),
  founder: path.join(pub, "uploads/founder"),
};

function listImages(dirRel) {
  const dir = path.join(pub, dirRel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => `/${dirRel}/${f}`);
}

router.get("/pamphlets", (req, res) => {
  res.json(listImages("uploads/pamphlets"));
});

// Featured faculty for home with details
router.get("/faculty", async (req, res) => {
  try{
    const items = await Faculty.find({ featuredHome: true }).sort({ name: 1 }).limit(24);
    if (items.length > 0) return res.json(items);
    // Fallback to raw images if no faculty docs exist yet
    const imgs = listImages("uploads/faculty").slice(0,24);
    return res.json(imgs.map(src => ({ name: "Faculty", degree: "", subjects: "", photo: src })));
  }catch(e){ res.status(500).json({ error: "Failed" }); }
});

router.get("/founder", async (req, res) => {
  try{
    const doc = await Founder.findOne().sort({ updatedAt: -1 });
    if (doc) return res.json(doc);
    const items = listImages("uploads/founder");
    const photo = items[0] || null;
    return res.json({
      name: "",
      title: "",
      qualification: "",
      contact: "",
      photo
    });
  }catch(e){ res.status(500).json({ error: "Failed" }); }
});

export default router;

// Featured content for home page
router.get("/toppers", async (req, res) => {
  try{
    const items = await Topper.find({ featuredHome: true }).sort({ year: -1 }).limit(12);
    res.json(items);
  }catch(e){ res.status(500).json({ error: "Failed" }); }
});

router.get("/events", async (req, res) => {
  try{
    const items = await Event.find({ featuredHome: true }).sort({ year: -1 }).limit(12);
    res.json(items);
  }catch(e){ res.status(500).json({ error: "Failed" }); }
});


