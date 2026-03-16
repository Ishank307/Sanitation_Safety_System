require("dotenv").config();
const express = require("express");
const cors = require("cors");

const workerRoutes = require("./routes/workerRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const { sensorRouter, sosRouter, dashboardRouter } = require("./routes/otherRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Health Check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", project: "Sanitation Safety System - SAMVED 2026", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/workers", workerRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/sensors", sensorRouter);
app.use("/api/sos", sosRouter);
app.use("/api/dashboard", dashboardRouter);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Sanitation Safety Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});
