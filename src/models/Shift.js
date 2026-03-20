const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const shiftSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  workerId: { type: String, required: true }, // References User.id
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  totalHours: { type: Number, default: null },
  status: { type: String, enum: ["active", "completed"], default: "active" },
});

module.exports = mongoose.model("Shift", shiftSchema);
