const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const SAFETY = require("../config/safetyConfig");
const { triggerAlert } = require("../utils/alertHelper");

// POST /api/shifts/start
const startShift = (req, res) => {
  try {
    const workerId = req.user.id;

    // Check if already has an active shift
    const active = db.shifts.find((s) => s.workerId === workerId && s.status === "active");
    if (active) {
      return res.status(409).json({ success: false, message: "Shift already active", shiftId: active.id });
    }

    const shift = {
      id: uuidv4(),
      workerId,
      startTime: new Date().toISOString(),
      endTime: null,
      totalHours: null,
      status: "active",
    };

    db.shifts.push(shift);
    return res.status(201).json({ success: true, message: "Shift started", data: shift });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/shifts/end
const endShift = (req, res) => {
  try {
    const workerId = req.user.id;

    const shift = db.shifts.find((s) => s.workerId === workerId && s.status === "active");
    if (!shift) {
      return res.status(404).json({ success: false, message: "No active shift found" });
    }

    const endTime = new Date();
    const startTime = new Date(shift.startTime);
    const totalHours = parseFloat(((endTime - startTime) / (1000 * 60 * 60)).toFixed(2));

    shift.endTime = endTime.toISOString();
    shift.totalHours = totalHours;
    shift.status = "completed";

    // Flag if overworked
    if (totalHours > SAFETY.shift.MAX_HOURS) {
      triggerAlert({
        type: "OVERWORK",
        workerId,
        message: `Worker exceeded max shift hours (${totalHours}h > ${SAFETY.shift.MAX_HOURS}h)`,
        severity: "high",
      });
    }

    return res.status(200).json({ success: true, message: "Shift ended", data: shift });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/shifts/my  — worker views their own shifts
const getMyShifts = (req, res) => {
  const workerId = req.user.id;
  const shifts = db.shifts.filter((s) => s.workerId === workerId);
  return res.status(200).json({ success: true, count: shifts.length, data: shifts });
};

// GET /api/shifts — supervisor sees all
const getAllShifts = (req, res) => {
  return res.status(200).json({ success: true, count: db.shifts.length, data: db.shifts });
};

module.exports = { startShift, endShift, getMyShifts, getAllShifts };
