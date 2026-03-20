const { Task, TASK_TYPES } = require("../models/Task");
const { User } = require("../models/User");

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, type, zone, workerId } = req.body;
    const creator = req.user;

    if (!title || !zone) {
      return res.status(400).json({ success: false, message: "title and zone are required" });
    }

    // Coordinators can only assign within their own zone
    if (creator.role === "zonal_coordinator" && creator.zone !== zone) {
      return res.status(403).json({ success: false, message: "You can only create tasks in your assigned zone" });
    }

    // If workerId given, verify that worker exists and is in the correct zone
    if (workerId) {
      const worker = await User.findOne({ id: workerId, role: "worker" });
      if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });
      if (worker.zone !== zone) return res.status(400).json({ success: false, message: "Worker is not assigned to this zone" });
    }

    const task = await Task.create({
      title,
      description: description || "",
      type: type || "Routine",
      zone,
      workerId: workerId || null,
      createdBy: creator.id,
    });

    return res.status(201).json({ success: true, message: "Task created", data: task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === "worker") {
      query.workerId = user.id;
    } else if (user.role === "zonal_coordinator") {
      query.zone = user.zone;
    }
    // Admin sees all

    if (req.query.status) query.status = req.query.status;
    if (req.query.zone && user.role === "admin") query.zone = req.query.zone;

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = req.user;
    const validStatuses = ["pending", "in_progress", "completed", "escalated"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const task = await Task.findOne({ id: req.params.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Workers can only update their own tasks
    if (user.role === "worker" && task.workerId !== user.id) {
      return res.status(403).json({ success: false, message: "You can only update your own assigned tasks" });
    }

    if (user.role === "worker" && status === "in_progress") {
      const Shift = require("../models/Shift");
      const activeShift = await Shift.findOne({ workerId: user.id, status: "active" });
      if (!activeShift) {
        return res.status(403).json({ success: false, message: "Active shift required to start tasks" });
      }
    }

    // Coordinators can only update tasks in their zone
    if (user.role === "zonal_coordinator" && task.zone !== user.zone) {
      return res.status(403).json({ success: false, message: "Access denied outside your zone" });
    }

    task.status = status;
    task.updatedAt = new Date();
    await task.save();

    return res.status(200).json({ success: true, message: "Task updated", data: task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/tasks/:id/assign
const assignTask = async (req, res) => {
  try {
    const { workerId } = req.body;
    const user = req.user;

    const task = await Task.findOne({ id: req.params.id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (user.role === "zonal_coordinator" && task.zone !== user.zone) {
      return res.status(403).json({ success: false, message: "Cannot reassign tasks outside your zone" });
    }

    const worker = await User.findOne({ id: workerId, role: "worker", zone: task.zone });
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found in this zone" });

    task.workerId = workerId;
    task.updatedAt = new Date();
    await task.save();

    return res.status(200).json({ success: true, message: "Task assigned to worker", data: task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createTask, getTasks, updateTaskStatus, assignTask };
