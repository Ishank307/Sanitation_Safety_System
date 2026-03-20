const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const alertSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  type: { type: String, required: true }, // e.g. "SOS", "GAS_HAZARD"
  workerId: { type: String, default: null }, // References User.id if applicable
  manholeId: { type: String, default: null },
  zone: { type: String, default: null },
  message: { type: String, required: true },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
  timestamp: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: Date, default: null }
});

module.exports = mongoose.model("Alert", alertSchema);
