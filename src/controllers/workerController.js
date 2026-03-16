const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// POST /api/workers/register
const registerWorker = async (req, res) => {
  try {
    const { name, phone, zone, password, medicalHistory } = req.body;

    if (!name || !phone || !zone || !password) {
      return res.status(400).json({ success: false, message: "name, phone, zone, password are required" });
    }

    const exists = db.workers.find((w) => w.phone === phone);
    if (exists) {
      return res.status(409).json({ success: false, message: "Worker with this phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = {
      id: uuidv4(),
      name,
      phone,
      zone,
      password: hashedPassword,
      medicalHistory: medicalHistory || null,
      role: "worker",
      createdAt: new Date().toISOString(),
    };

    db.workers.push(worker);

    const { password: _, ...workerSafe } = worker;
    return res.status(201).json({ success: true, message: "Worker registered", data: workerSafe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/workers/login
const loginWorker = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "phone and password are required" });
    }

    const worker = db.workers.find((w) => w.phone === phone);
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const valid = await bcrypt.compare(password, worker.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: worker.id, phone: worker.phone, role: worker.role, zone: worker.zone },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({ success: true, token, workerId: worker.id, name: worker.name });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/workers — Supervisor only
const getAllWorkers = (req, res) => {
  const workers = db.workers.map(({ password, ...w }) => w);
  return res.status(200).json({ success: true, count: workers.length, data: workers });
};

// GET /api/workers/:id
const getWorkerById = (req, res) => {
  const worker = db.workers.find((w) => w.id === req.params.id);
  if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });
  const { password, ...workerSafe } = worker;
  return res.status(200).json({ success: true, data: workerSafe });
};

module.exports = { registerWorker, loginWorker, getAllWorkers, getWorkerById };
