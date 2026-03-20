const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const workerSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  zone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  medicalHistory: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["worker", "supervisor", "admin"],
    default: "worker",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Worker", workerSchema);
