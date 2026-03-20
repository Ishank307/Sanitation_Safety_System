const Shift = require("../models/Shift");
const SAFETY = require("../config/safetyConfig");
const { triggerAlert } = require("../utils/alertHelper");

// POST /api/shifts/start
const startShift = async (req, res) => {
  try {
    const workerId = req.user.id;
    const active = await Shift.findOne({ workerId, status: "active" });
    if (active) {
      return res.status(409).json({ success: false, message: "Shift already active", shiftId: active.id });
    }

    const shift = await Shift.create({ workerId });
    return res.status(201).json({ success: true, message: "Shift started", data: shift });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/shifts/end
const endShift = async (req, res) => {
  try {
    const workerId = req.user.id;
    const shift = await Shift.findOne({ workerId, status: "active" });
    if (!shift) {
      return res.status(404).json({ success: false, message: "No active shift found" });
    }

    const endTime = new Date();
    const startTime = new Date(shift.startTime);
    const totalHours = parseFloat(((endTime - startTime) / (1000 * 60 * 60)).toFixed(2));

    shift.endTime = endTime;
    shift.totalHours = totalHours;
    shift.status = "completed";
    await shift.save();

    if (totalHours > SAFETY.shift.MAX_HOURS) {
      await triggerAlert({
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

// GET /api/shifts/my
const getMyShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ workerId: req.user.id }).sort({ startTime: -1 });
    return res.status(200).json({ success: true, count: shifts.length, data: shifts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/shifts
const getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ startTime: -1 });
    return res.status(200).json({ success: true, count: shifts.length, data: shifts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { startShift, endShift, getMyShifts, getAllShifts };
