import mongoose from "mongoose";

const founderSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  title: { type: String, default: "" },
  qualification: { type: String, default: "" },
  contact: { type: String, default: "" },
  instagram: { type: String, default: "" },
  whatsapp: { type: String, default: "" },
  facebook: { type: String, default: "" },
  photo: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Founder", founderSchema);
