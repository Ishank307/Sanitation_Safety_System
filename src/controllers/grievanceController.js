const { Grievance } = require("../models/Grievance");
const { Task } = require("../models/Task");
const { User } = require("../models/User");

const publicImagePath = (filename) => `/uploads/grievances/${filename}`;

const serializeGrievance = (g) => {
  const o = g.toObject ? g.toObject() : { ...g };
  delete o._id;
  if (o.imageRelPath) {
    o.imageUrl = o.imageRelPath;
  }
  return o;
};

// POST /api/grievances/complaint (multipart: text, image)
const createComplaint = async (req, res) => {
  try {
    const user = req.user;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required for a sanitation complaint" });
    }
    const text = (req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ success: false, message: "Grievance description is required" });
    }
    if (!user.zone) {
      return res.status(400).json({ success: false, message: "Your account has no zone; contact support" });
    }

    const imageRelPath = publicImagePath(req.file.filename);
    const g = await Grievance.create({
      kind: "complaint",
      zone: user.zone,
      submittedBy: user.id,
      submitterName: user.name || "Citizen",
      submitterPhone: user.phone || "",
      text,
      imageRelPath,
      status: "open",
    });

    return res.status(201).json({ success: true, message: "Complaint submitted. Your zonal and central coordinators have been notified.", data: serializeGrievance(g) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/grievances/suggestion (multipart optional: image; text required)
const createSuggestion = async (req, res) => {
  try {
    const user = req.user;
    const text = (req.body.text || "").trim();
    if (!text) {
      return res.status(400).json({ success: false, message: "Suggestion text is required" });
    }
    if (!user.zone) {
      return res.status(400).json({ success: false, message: "Your account has no zone; contact support" });
    }

    let imageRelPath = null;
    if (req.file) {
      imageRelPath = publicImagePath(req.file.filename);
    }

    const g = await Grievance.create({
      kind: "suggestion",
      zone: user.zone,
      submittedBy: user.id,
      submitterName: user.name || "Citizen",
      submitterPhone: user.phone || "",
      text,
      imageRelPath,
      status: "open",
    });

    return res.status(201).json({ success: true, message: "Suggestion submitted.", data: serializeGrievance(g) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/grievances — admin: all; zonal: own zone; civilian: own submissions
const listGrievances = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === "civilian") {
      query.submittedBy = user.id;
    } else if (user.role === "zonal_coordinator") {
      query.zone = user.zone;
    }

    if (user.role === "admin" && req.query.zone) {
      query.zone = req.query.zone;
    }
    if (req.query.kind && ["complaint", "suggestion"].includes(req.query.kind)) {
      query.kind = req.query.kind;
    }

    const list = await Grievance.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: list.length, data: list.map(serializeGrievance) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/grievances/:id/assign-task — complaint only
const assignTaskFromGrievance = async (req, res) => {
  try {
    const { workerId } = req.body;
    if (!workerId) {
      return res.status(400).json({ success: false, message: "workerId is required" });
    }

    const grievance = await Grievance.findOne({ id: req.params.id });
    if (!grievance) {
      return res.status(404).json({ success: false, message: "Grievance not found" });
    }
    if (grievance.kind !== "complaint") {
      return res.status(400).json({ success: false, message: "Only complaints can be assigned as tasks" });
    }
    if (grievance.status !== "open") {
      return res.status(400).json({ success: false, message: "This grievance is already being handled or resolved" });
    }

    const actor = req.user;
    if (actor.role === "zonal_coordinator" && grievance.zone !== actor.zone) {
      return res.status(403).json({ success: false, message: "You can only act on grievances in your zone" });
    }

    const worker = await User.findOne({ id: workerId, role: "worker", zone: grievance.zone });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found in this zone" });
    }

    const title = `Citizen report: ${grievance.text.slice(0, 72)}${grievance.text.length > 72 ? "…" : ""}`;
    const description = `Ref: ${grievance.id}\nFrom: ${grievance.submitterName} (${grievance.submitterPhone})\n\n${grievance.text}`;

    const task = await Task.create({
      title,
      description,
      type: "Citizen Report",
      zone: grievance.zone,
      workerId,
      grievanceId: grievance.id,
      createdBy: actor.id,
    });

    grievance.status = "assigned";
    grievance.linkedTaskId = task.id;
    grievance.updatedAt = new Date();
    await grievance.save();

    return res.status(201).json({ success: true, message: "Task created and assigned to worker", data: { grievance: serializeGrievance(grievance), task } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/grievances/:id/review — mark suggestion as reviewed
const markSuggestionReviewed = async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ id: req.params.id });
    if (!grievance) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (grievance.kind !== "suggestion") {
      return res.status(400).json({ success: false, message: "Only suggestions can be marked reviewed" });
    }

    const actor = req.user;
    if (actor.role === "zonal_coordinator" && grievance.zone !== actor.zone) {
      return res.status(403).json({ success: false, message: "Outside your zone" });
    }

    grievance.status = "reviewed";
    grievance.updatedAt = new Date();
    await grievance.save();

    return res.status(200).json({ success: true, data: serializeGrievance(grievance) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createComplaint,
  createSuggestion,
  listGrievances,
  assignTaskFromGrievance,
  markSuggestionReviewed,
  serializeGrievance,
};
