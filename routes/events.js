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
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "topperspoint",
  api_key: process.env.CLOUDINARY_API_KEY || "723391789564995",
  api_secret: process.env.CLOUDINARY_API_SECRET || "x-K6pTTMk9YVfLfxd-6nwS6Xzs4"
});

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'toppers-point/events',
    allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
  },
});
const upload = multer({ storage });

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
  try {
    const { title, year } = req.body;
    const ev = new Event({
      title,
      year,
      image: req.file ? req.file.path : ''
    });
    await ev.save();
    // If browser form submitted, redirect back to admin
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      return res.redirect('/admin');
    }
    res.json({ success: true, event: ev });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add event' });
  }
});

export default router;
