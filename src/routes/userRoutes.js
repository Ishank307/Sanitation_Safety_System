const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getAllUsers, getUserById } = require("../controllers/userController");
const { authMiddleware, requireZonalCoordinator } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", authMiddleware, requireZonalCoordinator, getAllUsers);
router.get("/:id", authMiddleware, getUserById);

module.exports = router;
