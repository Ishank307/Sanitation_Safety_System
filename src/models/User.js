const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  role: { type: String, enum: ["worker", "zonal_coordinator", "admin"], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  zone: { type: String, default: null }, // Required for worker and zonal_coordinator
  medicalHistory: { type: String, default: null }, // Relevant for worker
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
