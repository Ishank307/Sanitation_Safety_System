const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

/**
 * Central alert creator — called internally by other controllers
 * @param {Object} opts
 * @param {string} opts.type        - "SOS" | "GAS_HAZARD" | "OVERWORK"
 * @param {string} [opts.workerId]
 * @param {string} [opts.manholeId]
 * @param {string} [opts.zone]
 * @param {string} opts.message
 * @param {string} opts.severity    - "low" | "medium" | "high" | "critical"
 */
const triggerAlert = ({ type, workerId, manholeId, zone, message, severity }) => {
  const alert = {
    id: uuidv4(),
    type,
    workerId: workerId || null,
    manholeId: manholeId || null,
    zone: zone || null,
    message,
    severity,
    acknowledged: false,
    acknowledgedAt: null,
    timestamp: new Date().toISOString(),
  };

  db.alerts.push(alert);

  // In a real system: push via WebSocket, FCM, SMS here
  console.log(`[ALERT][${severity.toUpperCase()}] ${type}: ${message}`);

  return alert;
};

module.exports = { triggerAlert };
