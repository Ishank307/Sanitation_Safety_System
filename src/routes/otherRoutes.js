const express = require("express");

// --- Sensor Routes ---
const sensorRouter = express.Router();
const { ingestReading, getAllReadings, getLatestByManhole } = require("../controllers/sensorController");
const { authMiddleware, supervisorOnly } = require("../middleware/auth");

sensorRouter.post("/reading", ingestReading);                          // Raspberry Pi (no auth for now, add API key later)
sensorRouter.get("/readings", authMiddleware, supervisorOnly, getAllReadings);
sensorRouter.get("/latest/:manholeId", authMiddleware, getLatestByManhole);


// --- SOS Routes ---
const sosRouter = express.Router();
const { triggerSOS, getAllSOS, resolveSOS } = require("../controllers/sosController");

sosRouter.post("/", authMiddleware, triggerSOS);
sosRouter.get("/", authMiddleware, supervisorOnly, getAllSOS);
sosRouter.patch("/:id/resolve", authMiddleware, supervisorOnly, resolveSOS);


// --- Dashboard Routes ---
const dashboardRouter = express.Router();
const { getDashboardSummary, getZoneSummary, getAllAlerts, acknowledgeAlert } = require("../controllers/dashboardController");

dashboardRouter.get("/summary", authMiddleware, supervisorOnly, getDashboardSummary);
dashboardRouter.get("/zone/:zone", authMiddleware, supervisorOnly, getZoneSummary);
dashboardRouter.get("/alerts", authMiddleware, supervisorOnly, getAllAlerts);
dashboardRouter.patch("/alerts/:id/acknowledge", authMiddleware, supervisorOnly, acknowledgeAlert);


module.exports = { sensorRouter, sosRouter, dashboardRouter };
