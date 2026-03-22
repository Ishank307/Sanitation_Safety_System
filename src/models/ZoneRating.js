const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { ZONES } = require("./User");

const zoneRatingSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  zone: { type: String, enum: ZONES, required: true },
  submittedBy: { type: String, required: true },
  submitterName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  note: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const ZoneRating = mongoose.model("ZoneRating", zoneRatingSchema);
module.exports = { ZoneRating };
