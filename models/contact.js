import mongoose from "mongoose";
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: { type: Date, default: Date.now }
});
export default mongoose.model("Contact", ContactSchema);
