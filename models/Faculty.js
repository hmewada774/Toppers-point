import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  degree: { type: String, required: true },
  subjects: { type: String, required: true },
  photo: { type: String, required: true },
  featuredHome: { type: Boolean, default: false }
});

export default mongoose.model("Faculty", facultySchema);
