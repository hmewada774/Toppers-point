import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["file", "youtube", "vimeo"], required: true },
  videoUrl: { type: String, default: "" }, // For YouTube/Vimeo links
  videoFile: { type: String, default: "" }, // For uploaded files
  featuredHome: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Video", videoSchema);

