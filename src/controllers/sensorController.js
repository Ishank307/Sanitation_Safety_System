const SensorReading = require("../models/SensorReading");
const SAFETY = require("../config/safetyConfig");
const { triggerAlert } = require("../utils/alertHelper");

const evaluateHazard = (reading) => {
  const { gasH2S, gasCO, gasCH4, o2Level } = reading;
  const violations = [];

  if (gasH2S !== undefined && gasH2S > SAFETY.gas.H2S_MAX_PPM)
    violations.push(`H2S: ${gasH2S} ppm (limit: ${SAFETY.gas.H2S_MAX_PPM})`);
  if (gasCO !== undefined && gasCO > SAFETY.gas.CO_MAX_PPM)
    violations.push(`CO: ${gasCO} ppm (limit: ${SAFETY.gas.CO_MAX_PPM})`);
  if (gasCH4 !== undefined && gasCH4 > SAFETY.gas.CH4_MAX_PERCENT)
    violations.push(`CH4: ${gasCH4}% (limit: ${SAFETY.gas.CH4_MAX_PERCENT}%)`);
  if (o2Level !== undefined && o2Level < SAFETY.gas.O2_MIN_PERCENT)
    violations.push(`O2: ${o2Level}% (min: ${SAFETY.gas.O2_MIN_PERCENT}%)`);

  return violations;
};

// POST /api/sensors/reading
const ingestReading = async (req, res) => {
  try {
    const { manholeId, zone, gasH2S, gasCO, gasCH4, o2Level } = req.body;

    if (!manholeId || !zone) {
      return res.status(400).json({ success: false, message: "manholeId and zone are required" });
    }

    const violations = evaluateHazard({ gasH2S, gasCO, gasCH4, o2Level });
    const isHazardous = violations.length > 0;

    const reading = await SensorReading.create({
      manholeId,
      zone,
      gasH2S: gasH2S ?? null,
      gasCO: gasCO ?? null,
      gasCH4: gasCH4 ?? null,
      o2Level: o2Level ?? null,
      isHazardous,
      violations,
    });

    if (isHazardous) {
      await triggerAlert({
        type: "GAS_HAZARD",
        manholeId,
        zone,
        message: `Hazardous conditions detected at manhole ${manholeId} in zone ${zone}: ${violations.join(", ")}`,
        severity: "critical",
      });
    }

    return res.status(201).json({ success: true, isHazardous, violations, data: reading });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sensors/readings
const getAllReadings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "zonal_coordinator") query.zone = req.user.zone;
    if (req.query.zone && req.user.role === "admin") query.zone = req.query.zone;
    if (req.query.hazardous === "true") query.isHazardous = true;

    const readings = await SensorReading.find(query).sort({ timestamp: -1 });
    return res.status(200).json({ success: true, count: readings.length, data: readings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sensors/latest/:manholeId
const getLatestByManhole = async (req, res) => {
  try {
    const reading = await SensorReading.findOne({ manholeId: req.params.manholeId }).sort({ timestamp: -1 });
    if (!reading) return res.status(404).json({ success: false, message: "No readings found for this manhole" });
    
    // Check permission if zonal coordinator
    if (req.user.role === "zonal_coordinator" && reading.zone !== req.user.zone) {
      return res.status(403).json({ success: false, message: "Access denied to this zone" });
    }

    return res.status(200).json({ success: true, data: reading });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { ingestReading, getAllReadings, getLatestByManhole };
