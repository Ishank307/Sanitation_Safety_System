const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ZONES = [
  "Zone A (North)",
  "Zone B (Central)",
  "Zone C (East)",
  "Zone D (South)",
  "Zone E (West)",
  "Zone F (Industrial)",
];

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  role: { type: String, enum: ["worker", "zonal_coordinator", "admin", "civilian"], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  zone: { type: String, enum: [...ZONES, null], default: null },
  age: { type: Number, default: null }, // Used for dynamic hardware risk thresholding
  medicalHistory: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
module.exports = { User, ZONES };
