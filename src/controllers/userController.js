const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, phone, zone, password, medicalHistory, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: "name, phone, and password are required" });
    }

    const assignedRole = role || "worker";
    if (assignedRole !== "admin" && !zone) {
      return res.status(400).json({ success: false, message: "zone is required for workers and coordinators" });
    }

    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(409).json({ success: false, message: "User with this phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      zone: assignedRole === "admin" ? null : zone,
      password: hashedPassword,
      medicalHistory: medicalHistory || null,
      role: assignedRole,
    });

    const userSafe = user.toObject();
    delete userSafe.password;
    delete userSafe._id;

    return res.status(201).json({ success: true, message: "User registered", data: userSafe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "phone and password are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, zone: user.zone },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({ success: true, token, userId: user.id, name: user.name, role: user.role });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "zonal_coordinator") {
      query.zone = req.user.zone; // Coordinators only see their zone
    }

    const users = await User.find(query).select("-password -_id");
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select("-password -_id");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, getUserById };
