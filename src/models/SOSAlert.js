const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const sosAlertSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  workerId: { type: String, required: true }, // References User.id
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    description: { type: String, default: null }
  },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "resolved"], default: "active" },
  resolvedAt: { type: Date, default: null },
});

module.exports = mongoose.model("SOSAlert", sosAlertSchema);
