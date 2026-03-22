const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { ZONES } = require("./User");

const KINDS = ["complaint", "suggestion"];
const STATUSES = ["open", "assigned", "resolved", "reviewed"];

const grievanceSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  kind: { type: String, enum: KINDS, required: true },
  zone: { type: String, enum: ZONES, required: true },
  submittedBy: { type: String, required: true },
  submitterName: { type: String, required: true },
  submitterPhone: { type: String, default: "" },
  text: { type: String, required: true },
  imageRelPath: { type: String, default: null },
  status: { type: String, enum: STATUSES, default: "open" },
  linkedTaskId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Grievance = mongoose.model("Grievance", grievanceSchema);
module.exports = { Grievance, KINDS, STATUSES };
