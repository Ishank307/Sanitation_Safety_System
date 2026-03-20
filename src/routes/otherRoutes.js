const express = require("express");

// --- Sensor Routes ---
const sensorRouter = express.Router();
const { ingestReading, getAllReadings, getLatestByManhole } = require("../controllers/sensorController");
const { authMiddleware, requireZonalCoordinator } = require("../middleware/auth");

sensorRouter.post("/reading", ingestReading);                          // Raspberry Pi (no auth for now)
sensorRouter.get("/readings", authMiddleware, requireZonalCoordinator, getAllReadings);
sensorRouter.get("/latest/:manholeId", authMiddleware, getLatestByManhole);

// --- SOS Routes ---
const sosRouter = express.Router();
const { triggerSOS, getAllSOS, resolveSOS } = require("../controllers/sosController");

sosRouter.post("/", authMiddleware, triggerSOS);
sosRouter.get("/", authMiddleware, requireZonalCoordinator, getAllSOS);
sosRouter.patch("/:id/resolve", authMiddleware, requireZonalCoordinator, resolveSOS);

// --- Dashboard Routes ---
const dashboardRouter = express.Router();
const { getDashboardSummary, getZoneSummary, getAllAlerts, acknowledgeAlert } = require("../controllers/dashboardController");
const { requireAdmin } = require("../middleware/auth");

dashboardRouter.get("/summary", authMiddleware, requireAdmin, getDashboardSummary);
dashboardRouter.get("/zone/:zone", authMiddleware, requireZonalCoordinator, getZoneSummary);
dashboardRouter.get("/alerts", authMiddleware, requireZonalCoordinator, getAllAlerts);
dashboardRouter.patch("/alerts/:id/acknowledge", authMiddleware, requireZonalCoordinator, acknowledgeAlert);

module.exports = { sensorRouter, sosRouter, dashboardRouter };
