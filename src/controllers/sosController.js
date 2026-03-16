const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { triggerAlert } = require("../utils/alertHelper");

// POST /api/sos  — worker hits SOS button
const triggerSOS = (req, res) => {
  try {
    const workerId = req.user.id;
    const { location } = req.body; // optional: { lat, lng, description }

    const sos = {
      id: uuidv4(),
      workerId,
      location: location || null,
      timestamp: new Date().toISOString(),
      status: "active", // active | resolved
      resolvedAt: null,
    };

    db.sosAlerts.push(sos);

    // Also push to general alerts for dashboard
    triggerAlert({
      type: "SOS",
      workerId,
      message: `SOS triggered by worker ${workerId}${location ? " at " + JSON.stringify(location) : ""}`,
      severity: "critical",
    });

    return res.status(201).json({ success: true, message: "SOS alert sent", data: sos });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sos — supervisor views all active SOS
const getAllSOS = (req, res) => {
  const { status } = req.query;
  let alerts = [...db.sosAlerts];
  if (status) alerts = alerts.filter((a) => a.status === status);
  alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return res.status(200).json({ success: true, count: alerts.length, data: alerts });
};

// PATCH /api/sos/:id/resolve — supervisor resolves SOS
const resolveSOS = (req, res) => {
  const sos = db.sosAlerts.find((a) => a.id === req.params.id);
  if (!sos) return res.status(404).json({ success: false, message: "SOS alert not found" });
  if (sos.status === "resolved") {
    return res.status(400).json({ success: false, message: "Already resolved" });
  }

  sos.status = "resolved";
  sos.resolvedAt = new Date().toISOString();

  return res.status(200).json({ success: true, message: "SOS resolved", data: sos });
};

module.exports = { triggerSOS, getAllSOS, resolveSOS };
