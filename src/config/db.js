// db.js — In-memory store (swap with real DB later)
// Each key maps to an array acting as a table

const db = {
  workers: [],       // { id, name, phone, zone, medicalHistory, createdAt }
  shifts: [],        // { id, workerId, startTime, endTime, totalHours, status }
  sensorReadings: [],// { id, manholeId, zone, gasH2S, gasCO, gasCH4, o2Level, timestamp, isHazardous }
  sosAlerts: [],     // { id, workerId, location, timestamp, status, resolvedAt }
  alerts: [],        // { id, type, workerId|manholeId, message, severity, timestamp, acknowledged }
};

module.exports = db;
