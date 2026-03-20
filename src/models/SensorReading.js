const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const sensorReadingSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  manholeId: { type: String, required: true },
  zone: { type: String, required: true },
  gasH2S: { type: Number, default: null },
  gasCO: { type: Number, default: null },
  gasCH4: { type: Number, default: null },
  o2Level: { type: Number, default: null },
  isHazardous: { type: Boolean, default: false },
  violations: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SensorReading", sensorReadingSchema);
