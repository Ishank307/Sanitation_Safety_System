const SOSAlert = require("../models/SOSAlert");
const { triggerAlert } = require("../utils/alertHelper");

// POST /api/sos
const triggerSOS = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { location } = req.body;

    const sos = await SOSAlert.create({
      workerId,
      location: location || null,
    });

    await triggerAlert({
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

// GET /api/sos
const getAllSOS = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const alerts = await SOSAlert.find(query).sort({ timestamp: -1 });
    return res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/sos/:id/resolve
const resolveSOS = async (req, res) => {
  try {
    const sos = await SOSAlert.findOne({ id: req.params.id });
    if (!sos) return res.status(404).json({ success: false, message: "SOS alert not found" });
    
    if (sos.status === "resolved") {
      return res.status(400).json({ success: false, message: "Already resolved" });
    }

    sos.status = "resolved";
    sos.resolvedAt = new Date();
    await sos.save();

    return res.status(200).json({ success: true, message: "SOS resolved", data: sos });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { triggerSOS, getAllSOS, resolveSOS };
