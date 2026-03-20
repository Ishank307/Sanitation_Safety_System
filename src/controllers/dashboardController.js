const { User } = require("../models/User");
const Shift = require("../models/Shift");
const SOSAlert = require("../models/SOSAlert");
const SensorReading = require("../models/SensorReading");
const Alert = require("../models/Alert");

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    const totalWorkers = await User.countDocuments({ role: "worker" });
    const activeShifts = await Shift.countDocuments({ status: "active" });
    const activeSOS = await SOSAlert.countDocuments({ status: "active" });
    const unacknowledgedAlerts = await Alert.countDocuments({ acknowledged: false });
    const hazardousReadings = await SensorReading.countDocuments({ isHazardous: true });

    return res.status(200).json({
      success: true,
      data: {
        totalWorkers,
        activeShifts,
        activeSOS,
        unacknowledgedAlerts,
        hazardousReadings,
        lastUpdated: new Date()
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/zone/:zone
const getZoneSummary = async (req, res) => {
  try {
    const zone = req.params.zone;

    if (req.user.role === "zonal_coordinator" && req.user.zone !== zone) {
      return res.status(403).json({ success: false, message: "Access denied to this zone" });
    }

    const workers = await User.find({ role: "worker", zone }).select("-password -_id");
    const workerIds = workers.map(w => w.id);

    const activeShifts = await Shift.countDocuments({ zone, status: "active" });
    const recentReadings = await SensorReading.find({ zone }).sort({ timestamp: -1 }).limit(10);
    const sosAlerts = await SOSAlert.find({ zone, status: "active" });

    return res.status(200).json({
      success: true,
      zone,
      data: {
        workers,
        activeShifts,
        recentSensorReadings: recentReadings,
        sosAlerts,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/alerts
const getAllAlerts = async (req, res) => {
  try {
    const { acknowledged, severity } = req.query;
    let query = {};

    if (acknowledged !== undefined) query.acknowledged = acknowledged === "true";
    if (severity) query.severity = severity;

    if (req.user.role === "zonal_coordinator") {
      // Coordinator sees alerts for their zone, or where their workers are involved
      const usersInZone = await User.find({ zone: req.user.zone });
      const userIds = usersInZone.map(u => u.id);

      query.$or = [
        { zone: req.user.zone },
        { workerId: { $in: userIds } }
      ];
    }

    const alerts = await Alert.find(query).sort({ timestamp: -1 });
    return res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/dashboard/alerts/:id/acknowledge
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({ id: req.params.id });
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });

    if (req.user.role === "zonal_coordinator" && alert.zone && alert.zone !== req.user.zone) {
      return res.status(403).json({ success: false, message: "Cannot acknowledge alerts outside your zone" });
    }

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    await alert.save();

    return res.status(200).json({ success: true, message: "Alert acknowledged", data: alert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardSummary, getZoneSummary, getAllAlerts, acknowledgeAlert };
