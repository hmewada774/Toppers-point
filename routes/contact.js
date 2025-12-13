import express from "express";
import Contact from "../models/contact.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    const newContact = new Contact({ name, email, phone: phone || "", message });
    await newContact.save();
    return res.json({ message: "Your message has been sent successfully!" });
  } catch (e) {
    return res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
});

export default router;
