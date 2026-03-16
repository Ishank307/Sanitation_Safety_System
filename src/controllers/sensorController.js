const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const SAFETY = require("../config/safetyConfig");
const { triggerAlert } = require("../utils/alertHelper");

// Evaluate sensor reading against safety thresholds
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
// Called by Raspberry Pi (or simulator) to push sensor data
const ingestReading = (req, res) => {
  try {
    const { manholeId, zone, gasH2S, gasCO, gasCH4, o2Level } = req.body;

    if (!manholeId || !zone) {
      return res.status(400).json({ success: false, message: "manholeId and zone are required" });
    }

    const violations = evaluateHazard({ gasH2S, gasCO, gasCH4, o2Level });
    const isHazardous = violations.length > 0;

    const reading = {
      id: uuidv4(),
      manholeId,
      zone,
      gasH2S: gasH2S ?? null,
      gasCO: gasCO ?? null,
      gasCH4: gasCH4 ?? null,
      o2Level: o2Level ?? null,
      isHazardous,
      violations,
      timestamp: new Date().toISOString(),
    };

    db.sensorReadings.push(reading);

    // Auto-trigger alert if hazardous
    if (isHazardous) {
      triggerAlert({
        type: "GAS_HAZARD",
        manholeId,
        zone,
        message: `Hazardous conditions detected at manhole ${manholeId} in zone ${zone}: ${violations.join(", ")}`,
        severity: "critical",
      });
    }

    return res.status(201).json({
      success: true,
      isHazardous,
      violations,
      data: reading,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sensors/readings — supervisor
const getAllReadings = (req, res) => {
  const { zone, hazardous } = req.query;
  let readings = [...db.sensorReadings];

  if (zone) readings = readings.filter((r) => r.zone === zone);
  if (hazardous === "true") readings = readings.filter((r) => r.isHazardous);

  // Latest first
  readings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return res.status(200).json({ success: true, count: readings.length, data: readings });
};

// GET /api/sensors/latest/:manholeId
const getLatestByManhole = (req, res) => {
  const readings = db.sensorReadings
    .filter((r) => r.manholeId === req.params.manholeId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (!readings.length) {
    return res.status(404).json({ success: false, message: "No readings found for this manhole" });
  }
  return res.status(200).json({ success: true, data: readings[0] });
};

module.exports = { ingestReading, getAllReadings, getLatestByManhole };
