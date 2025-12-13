// const mongoose = require('mongoose');

// const topperSchema = new mongoose.Schema({
//   name: String,
//   year: Number,
//   subject: String,
//   class: String,
//   marks: Number,
//   photo: String
// });

// module.exports = mongoose.model('Topper', topperSchema);


import mongoose from "mongoose";

const topperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  marks: { type: Number, required: true },
  photo: { type: String }, // file path of uploaded image
  featuredHome: { type: Boolean, default: false },
});

export default mongoose.model("Topper", topperSchema);
