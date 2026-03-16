const express = require("express");
const router = express.Router();
const { registerWorker, loginWorker, getAllWorkers, getWorkerById } = require("../controllers/workerController");
const { authMiddleware, supervisorOnly } = require("../middleware/auth");

router.post("/register", registerWorker);
router.post("/login", loginWorker);
router.get("/", authMiddleware, supervisorOnly, getAllWorkers);
router.get("/:id", authMiddleware, getWorkerById);

module.exports = router;
