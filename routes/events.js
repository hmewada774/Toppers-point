// import express from "express";
// import Event from "../models/Event.js";
// import multer from "multer";

// const router = express.Router();
// const upload = multer({ dest: "public/uploads/events/" });

// router.get("/", async (req, res) => {
//   const events = await Event.find();
//   res.json(events);
// });

// router.post("/add", upload.single("image"), async (req, res) => {
//   const { title, year, description } = req.body;
//   const newEvent = new Event({
//     title,
//     year,
//     description,
//     image: req.file ? `/uploads/events/${req.file.filename}` : ""
//   });
//   await newEvent.save();
//   res.json({ message: "Event added successfully!" });
// });

// export default router;



import express from 'express';
import Event from '../models/Event.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../public/uploads/events');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only images are allowed"), ok);
  }
});

router.get('/', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Add event (alternative endpoint for admin form)
// Require session for API add as well
router.post('/add', upload.single('image'), async (req, res) => {
  if (!(req.session && req.session.user)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try{
    const { title, year } = req.body;
    const ev = new Event({
      title,
      year,
      image: req.file ? `/uploads/events/${req.file.filename}` : ''
    });
    await ev.save();
    // If browser form submitted, redirect back to admin
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      return res.redirect('/admin');
    }
    res.json({ success:true, event: ev });
  }catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Failed to add event' });
  }
});

export default router;
