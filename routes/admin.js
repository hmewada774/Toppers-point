import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Topper from "../models/Topper.js";
import Event from "../models/Event.js";
import Faculty from "../models/Faculty.js";
import Founder from "../models/Founder.js";
import Video from "../models/Video.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure uploads directories exist
const uploadDir = path.join(__dirname, "../public/uploads");
const eventsUploadDir = path.join(__dirname, "../public/uploads/events");
const pamphletsDir = path.join(__dirname, "../public/uploads/pamphlets");
const facultyDir = path.join(__dirname, "../public/uploads/faculty");
const founderDir = path.join(__dirname, "../public/uploads/founder");
const videosDir = path.join(__dirname, "../public/uploads/videos");
if (!process.env.VERCEL) {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  for (const d of [eventsUploadDir, pamphletsDir, facultyDir, founderDir, videosDir]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

// ✅ Multer setup with absolute path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only images are allowed"), ok);
  }
});

// 🗑️ Delete faculty by id (and image file)
router.post("/faculty/delete/:id", async (req, res) => {
  try {
    const doc = await Faculty.findByIdAndDelete(req.params.id);
    if (doc && doc.photo) {
      const p = path.join(__dirname, "../public", doc.photo);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    return res.redirect("/admin#faculty");
  } catch (e) { console.error(e); return res.status(500).send("Error deleting faculty"); }
});

// 🗑️ Delete event by id (and image file)
router.post("/events/delete/:id", async (req, res) => {
  try {
    const doc = await Event.findByIdAndDelete(req.params.id);
    if (doc && doc.image) {
      const p = path.join(__dirname, "../public", doc.image);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    return res.redirect("/admin");
  } catch (e) { console.error(e); return res.status(500).send("Error deleting event"); }
});

// 🗑️ Delete founder by id (and image file)
router.post("/founder/delete/:id", async (req, res) => {
  try {
    const doc = await Founder.findByIdAndDelete(req.params.id);
    if (doc && doc.photo) {
      const p = path.join(__dirname, "../public", doc.photo);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    return res.redirect("/admin");
  } catch (e) { console.error(e); return res.status(500).send("Error deleting founder"); }
});

// 🗑️ Delete pamphlet by file path (relative within uploads/pamphlets)
router.post("/home/pamphlets/delete", async (req, res) => {
  try {
    const rel = (req.body && req.body.path) || ""; // expected like /uploads/pamphlets/xyz.jpg
    if (!rel.startsWith("/uploads/pamphlets/")) return res.status(400).send("Bad path");
    const abs = path.join(__dirname, "../public", rel);
    if (abs.startsWith(pamphletsDir) && fs.existsSync(abs)) fs.unlinkSync(abs);
    return res.redirect("/admin");
  } catch (e) { console.error(e); return res.status(500).send("Error deleting pamphlet"); }
});

const eventsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventsUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadEvent = multer({
  storage: eventsStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only images are allowed"), ok);
  }
});

function makeUpload(dir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
      cb(ok ? null : new Error("Only images are allowed"), ok);
    }
  });
}
const uploadPamphlet = makeUpload(pamphletsDir);
const uploadFaculty = makeUpload(facultyDir);
const uploadFounder = makeUpload(founderDir);

// Video upload (larger file size limit)
function makeVideoUpload(dir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  return multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB for videos
    fileFilter: (req, file, cb) => {
      const ok = ["video/mp4", "video/webm", "video/quicktime"].includes(file.mimetype);
      cb(ok ? null : new Error("Only video files are allowed (MP4, WebM)"), ok);
    }
  });
}
const uploadVideo = makeVideoUpload(videosDir);

// Helper function to handle responses
function handleResponse(res, redirectUrl, message, isAjax = false) {
  if (isAjax) {
    return res.json({ success: true, message, redirect: redirectUrl });
  }
  return res.redirect(redirectUrl);
}

// Auth guard
router.use((req, res, next) => {
  if (req.session && req.session.user) return next();
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));
  if (isAjax) {
    return res.status(401).json({ success: false, message: 'Unauthorized', redirect: '/admin-login.html' });
  }
  return res.redirect("/admin-login.html");
});

// 🧩 Admin dashboard page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin.html"));
});

// Admin data lists
router.get("/toppers", async (req, res) => {
  try { const ts = await Topper.find().sort({ year: -1 }); res.json(ts); }
  catch (e) { res.status(500).json({ error: "Failed" }); }
});
router.get("/faculty", async (req, res) => {
  try { const fsList = await Faculty.find().sort({ name: 1 }); res.json(fsList); }
  catch (e) { res.status(500).json({ error: "Failed" }); }
});

// 🧠 Add new topper (handles photo + info)
router.post("/toppers/add", upload.single("photo"), async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    const { name, year, subject, marks, className } = req.body;

    // Save topper info with image path
    const newTopper = new Topper({
      name,
      year,
      subject,
      marks,
      className,
      photo: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await newTopper.save();
    console.log("✅ New topper added:", newTopper.name);

    if (isAjax) {
      return res.json({
        success: true,
        message: 'Topper added successfully!',
        topper: newTopper
      });
    }

    res.redirect("/admin#toppers");
  } catch (err) {
    console.error("❌ Error adding topper:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error adding topper',
        error: err.message
      });
    }

    res.status(500).send("Error adding topper");
  }
});

// 📸 Add event (title, year, image)
router.post("/events/add", uploadEvent.single("image"), async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    const { title, year } = req.body;
    const event = new Event({
      title,
      year,
      image: req.file ? `/uploads/events/${req.file.filename}` : "",
    });
    await event.save();
    console.log("✅ Event added:", title);

    if (isAjax) {
      return res.json({
        success: true,
        message: 'Event added successfully!',
        event: event
      });
    }

    res.redirect("/admin#events");
  } catch (err) {
    console.error("❌ Error adding event:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error adding event',
        error: err.message
      });
    }

    res.status(500).send("Error adding event");
  }
});

// 📰 Add pamphlet image for home page
router.post("/pamphlet/upload", uploadPamphlet.single("image"), async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const imagePath = `/uploads/pamphlets/${req.file.filename}`;

    if (isAjax) {
      return res.json({
        success: true,
        message: 'Pamphlet uploaded successfully!',
        imagePath: imagePath
      });
    }

    res.redirect("/admin#pamphlets");
  } catch (err) {
    console.error("❌ Error adding pamphlet:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading pamphlet',
        error: err.message
      });
    }

    res.status(500).send("Error adding pamphlet");
  }
});

// 👩‍🏫 Add faculty with details
router.post("/faculty/add", uploadFaculty.single("image"), async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    const { name, degree, subjects } = req.body;
    const f = new Faculty({
      name,
      degree,
      subjects: subjects.split(',').map(s => s.trim()),
      photo: req.file ? `/uploads/faculty/${req.file.filename}` : "",
      featuredHome: true,
    });
    await f.save();

    if (isAjax) {
      return res.json({
        success: true,
        message: 'Faculty member added successfully!',
        faculty: f
      });
    }

    res.redirect("/admin#faculty");
  } catch (err) {
    console.error("❌ Error adding faculty:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error adding faculty member',
        error: err.message
      });
    }

    res.status(500).send("Error adding faculty");
  }
});

// 👤 Add/update founder image and details
router.post("/founder/save", uploadFounder.single("image"), async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    const { name, description } = req.body;
    const updateData = { name, description };

    if (req.file) {
      updateData.photo = `/uploads/founder/${req.file.filename}`;
    } else if (req.body.photo) {
      updateData.photo = req.body.photo;
    }

    // Find and update or create new founder
    const founder = await Founder.findOneAndUpdate(
      {},
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (isAjax) {
      return res.json({
        success: true,
        message: 'Founder details saved successfully!',
        founder: founder
      });
    }

    res.redirect("/admin#founder");
  } catch (err) {
    console.error("❌ Error saving founder details:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error saving founder details',
        error: err.message
      });
    }

    res.status(500).send("Error saving founder details");
  }
});

// 🧑‍💼 Save founder details (create or update latest)
router.post("/founder/save", uploadFounder.single("image"), async (req, res) => {
  try {
    const { name, title, qualification, contact, instagram, whatsapp, facebook } = req.body;
    const doc = new Founder({
      name, title, qualification, contact, instagram, whatsapp, facebook,
      photo: req.file ? `/uploads/founder/${req.file.filename}` : (req.body.photo || "")
    });
    await doc.save();
    return res.redirect("/admin#founder");
  } catch (e) { console.error(e); return res.status(500).send("Error saving founder"); }
});

// Fetch current founder for admin prefill
router.get("/founder", async (req, res) => {
  try { const doc = await Founder.findOne().sort({ updatedAt: -1 }); return res.json(doc || {}); }
  catch (e) { return res.status(500).json({ error: "Failed" }); }
});

// ⭐ Feature/unfeature on home — toppers
router.post("/home/toppers/feature/:id", async (req, res) => {
  try { await Topper.findByIdAndUpdate(req.params.id, { featuredHome: true }); res.redirect("/admin#toppers"); }
  catch (e) { console.error(e); res.status(500).send("Error"); }
});
router.post("/home/toppers/unfeature/:id", async (req, res) => {
  try { await Topper.findByIdAndUpdate(req.params.id, { featuredHome: false }); res.redirect("/admin#toppers"); }
  catch (e) { console.error(e); res.status(500).send("Error"); }
});

// ⭐ Feature/unfeature on home — events
router.post("/home/events/feature/:id", async (req, res) => {
  try { await Event.findByIdAndUpdate(req.params.id, { featuredHome: true }); res.redirect("/admin#events"); }
  catch (e) { console.error(e); res.status(500).send("Error"); }
});
router.post("/home/events/unfeature/:id", async (req, res) => {
  try { await Event.findByIdAndUpdate(req.params.id, { featuredHome: false }); res.redirect("/admin#events"); }
  catch (e) { console.error(e); res.status(500).send("Error"); }
});

// ⭐ Feature/unfeature on home — faculty
router.post("/home/faculty/feature/:id", async (req, res) => {
  try { await Faculty.findByIdAndUpdate(req.params.id, { featuredHome: true }); res.redirect("/admin#faculty"); }
  catch (e) { console.error(e); res.status(500).send("Error"); }
});
router.post("/home/faculty/unfeature/:id", async (req, res) => {
  try { await Faculty.findByIdAndUpdate(req.params.id, { featuredHome: false }); res.redirect("/admin#faculty"); }
  catch (e) { console.error(e); res.status(500).send("Error"); }
});

// Delete topper (with photo deletion)
router.post("/toppers/delete/:id", async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    const topper = await Topper.findById(req.params.id);
    if (!topper) {
      if (isAjax) {
        return res.status(404).json({ success: false, message: 'Topper not found' });
      }
      return res.status(404).send("Topper not found");
    }

    // Delete the photo file if it exists
    if (topper.photo) {
      const photoPath = path.join(__dirname, "../public", topper.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Topper.findByIdAndDelete(req.params.id);
    console.log(" Topper deleted:", req.params.id);

    if (isAjax) {
      return res.json({
        success: true,
        message: 'Topper deleted successfully!',
        topperId: req.params.id
      });
    }

    res.redirect("/admin#toppers");
  } catch (err) {
    console.error(" Error deleting topper:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting topper',
        error: err.message
      });
    }

    res.status(500).send("Error deleting topper");
  }
});

// Get all toppers (API for frontend)
router.get("/toppers", async (req, res) => {
  try {
    const toppers = await Topper.find().sort({ year: -1 });
    res.json(toppers);
  } catch (err) {
    console.error("❌ Error fetching toppers:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching toppers',
        error: err.message
      });
    }

    res.status(500).json({ error: "Failed to fetch toppers" });
  }
});

// 🎥 Video Management
router.post("/videos/add", uploadVideo.single("video"), async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    const { title, description, videoType, videoUrl } = req.body;

    // Handle different video types
    let videoData = {
      title,
      description,
      type: videoType,
      [videoType === 'file' ? 'videoFile' : 'videoUrl']:
        videoType === 'file'
          ? req.file ? `/uploads/videos/${req.file.filename}` : ''
          : videoUrl
    };

    const video = new Video(videoData);
    await video.save();
    console.log("✅ Video added:", title);

    if (isAjax) {
      return res.json({
        success: true,
        message: 'Video added successfully!',
        video: video
      });
    }

    res.redirect("/admin#videos");
  } catch (err) {
    console.error("❌ Error adding video:", err);

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message: 'Error adding video',
        error: err.message
      });
    }

    res.status(500).send("Error adding video");
  }
});

router.get("/videos", async (req, res) => {
  const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

router.post("/videos/delete/:id", async (req, res) => {
  try {
    const doc = await Video.findById(req.params.id);
    if (doc && doc.videoFile) {
      const p = path.join(__dirname, "../public", doc.videoFile);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    await Video.findByIdAndDelete(req.params.id);
    return res.redirect("/admin");
  } catch (e) {
    console.error(e);
    return res.status(500).send("Error deleting video");
  }
});

router.post("/home/videos/feature/:id", async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { featuredHome: true });
    res.redirect("/admin");
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
});

router.post("/home/videos/unfeature/:id", async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { featuredHome: false });
    res.redirect("/admin");
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
});

export default router;
