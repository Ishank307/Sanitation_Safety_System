const db = require("../config/db");

// GET /api/dashboard/summary — high-level overview
const getDashboardSummary = (req, res) => {
  const totalWorkers = db.workers.length;
  const activeShifts = db.shifts.filter((s) => s.status === "active").length;
  const activeSOS = db.sosAlerts.filter((s) => s.status === "active").length;
  const unacknowledgedAlerts = db.alerts.filter((a) => !a.acknowledged).length;
  const hazardousReadings = db.sensorReadings.filter((r) => r.isHazardous).length;

  return res.status(200).json({
    success: true,
    data: {
      totalWorkers,
      activeShifts,
      activeSOS,
      unacknowledgedAlerts,
      hazardousReadings,
      lastUpdated: new Date().toISOString(),
    },
  });
};

// GET /api/dashboard/zone/:zone — zone-wise breakdown
const getZoneSummary = (req, res) => {
  const zone = req.params.zone;

  const workers = db.workers.filter((w) => w.zone === zone).map(({ password, ...w }) => w);
  const activeShifts = db.shifts.filter((s) => {
    const worker = db.workers.find((w) => w.id === s.workerId);
    return worker?.zone === zone && s.status === "active";
  });
  const recentReadings = db.sensorReadings
    .filter((r) => r.zone === zone)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
  const zoneSOS = db.sosAlerts.filter((s) => {
    const worker = db.workers.find((w) => w.id === s.workerId);
    return worker?.zone === zone;
  });

  return res.status(200).json({
    success: true,
    zone,
    data: {
      workers,
      activeShifts,
      recentSensorReadings: recentReadings,
      sosAlerts: zoneSOS,
    },
  });
};

// GET /api/dashboard/alerts — all system alerts
const getAllAlerts = (req, res) => {
  const { acknowledged, severity } = req.query;
  let alerts = [...db.alerts];

  if (acknowledged !== undefined) {
    alerts = alerts.filter((a) => a.acknowledged === (acknowledged === "true"));
  }
  if (severity) {
    alerts = alerts.filter((a) => a.severity === severity);
  }

  alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return res.status(200).json({ success: true, count: alerts.length, data: alerts });
};

// PATCH /api/dashboard/alerts/:id/acknowledge
const acknowledgeAlert = (req, res) => {
  const alert = db.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
  alert.acknowledged = true;
  alert.acknowledgedAt = new Date().toISOString();
  return res.status(200).json({ success: true, message: "Alert acknowledged", data: alert });
};

module.exports = { getDashboardSummary, getZoneSummary, getAllAlerts, acknowledgeAlert };
