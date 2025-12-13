import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  image: { type: String, required: true },
  featuredHome: { type: Boolean, default: false }
});

export default mongoose.model("Event", eventSchema);
