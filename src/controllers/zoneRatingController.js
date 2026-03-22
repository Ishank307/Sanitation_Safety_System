const { ZoneRating } = require("../models/ZoneRating");

const submitZoneRating = async (req, res) => {
  try {
    const user = req.user;
    const rating = parseInt(req.body.rating, 10);
    const note = (req.body.note || "").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "rating must be between 1 and 5" });
    }
    if (!user.zone) {
      return res.status(400).json({ success: false, message: "Your account has no zone" });
    }

    const row = await ZoneRating.create({
      zone: user.zone,
      submittedBy: user.id,
      submitterName: user.name || "Citizen",
      rating,
      note,
    });

    const safe = row.toObject();
    delete safe._id;
    return res.status(201).json({ success: true, message: "Thank you for rating your zone.", data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/zone-ratings — coordinators/admin see ratings (zonal scoped)
const listZoneRatings = async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    if (user.role === "zonal_coordinator") {
      query.zone = user.zone;
    } else if (user.role === "admin" && req.query.zone) {
      query.zone = req.query.zone;
    }

    const list = await ZoneRating.find(query).sort({ createdAt: -1 }).limit(500);
    const data = list.map((r) => {
      const o = r.toObject();
      delete o._id;
      return o;
    });

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitZoneRating, listZoneRatings };
