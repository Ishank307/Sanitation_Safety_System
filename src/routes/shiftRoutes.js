const express = require("express");
const router = express.Router();
const { startShift, endShift, getMyShifts, getAllShifts } = require("../controllers/shiftController");
const { authMiddleware, supervisorOnly } = require("../middleware/auth");

router.post("/start", authMiddleware, startShift);
router.post("/end", authMiddleware, endShift);
router.get("/my", authMiddleware, getMyShifts);
router.get("/", authMiddleware, supervisorOnly, getAllShifts);

module.exports = router;
