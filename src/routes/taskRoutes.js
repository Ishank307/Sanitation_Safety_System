const express = require("express");
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, assignTask } = require("../controllers/taskController");
const { authMiddleware, requireZonalCoordinator } = require("../middleware/auth");

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, requireZonalCoordinator, createTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus);
router.patch("/:id/assign", authMiddleware, requireZonalCoordinator, assignTask);

module.exports = router;
