const express = require("express");
const router = express.Router();
const {
  createComplaint,
  createSuggestion,
  listGrievances,
  assignTaskFromGrievance,
  markSuggestionReviewed,
} = require("../controllers/grievanceController");
const { submitZoneRating, listZoneRatings } = require("../controllers/zoneRatingController");
const { authMiddleware, requireZonalCoordinator, requireCivilian } = require("../middleware/auth");
const { uploadGrievanceImage } = require("../middleware/uploadGrievance");

router.get("/", authMiddleware, listGrievances);
router.get("/zone-ratings", authMiddleware, requireZonalCoordinator, listZoneRatings);

const uploadError = (err, req, res, next) => {
  if (err) return res.status(400).json({ success: false, message: err.message || "Upload failed" });
  next();
};

router.post("/complaint", authMiddleware, requireCivilian, uploadGrievanceImage.single("image"), uploadError, createComplaint);
router.post("/suggestion", authMiddleware, requireCivilian, uploadGrievanceImage.single("image"), uploadError, createSuggestion);
router.post("/zone-rating", authMiddleware, requireCivilian, submitZoneRating);

router.post("/:id/assign-task", authMiddleware, requireZonalCoordinator, assignTaskFromGrievance);
router.patch("/:id/review", authMiddleware, requireZonalCoordinator, markSuggestionReviewed);

module.exports = router;
