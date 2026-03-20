const Alert = require("../models/Alert");

/**
 * Creates an alert automatically in the DB.
 */
const triggerAlert = async ({ type, workerId, manholeId, zone, message, severity }) => {
  try {
    const alert = await Alert.create({
      type,
      workerId: workerId || null,
      manholeId: manholeId || null,
      zone: zone || null,
      message,
      severity,
    });

    console.log(`[ALERT][${severity.toUpperCase()}] ${type}: ${message}`);
    return alert;
  } catch (err) {
    console.error("Failed to trigger alert:", err.message);
  }
};

module.exports = { triggerAlert };
