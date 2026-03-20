const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { ZONES } = require("./User");

const TASK_TYPES = ["Routine", "Inspection", "Blockage", "Overflow", "Waste", "SOS Follow-up"];
const TASK_STATUSES = ["pending", "in_progress", "completed", "escalated"];

const taskSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: TASK_TYPES, default: "Routine" },
  status: { type: String, enum: TASK_STATUSES, default: "pending" },
  zone: { type: String, enum: ZONES, required: true },
  workerId: { type: String, default: null }, // id field of User
  createdBy: { type: String, required: true }, // id field of User (Coordinator/Admin)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = { Task, TASK_TYPES, TASK_STATUSES };
