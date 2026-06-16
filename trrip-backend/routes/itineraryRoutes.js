const express = require("express");
const router = express.Router();
const {
  getMyItineraries,
  getItinerary,
  getSharedItinerary,
  toggleShare,
  deleteItinerary,
} = require("../controllers/itineraryController");
const { protect } = require("../middlewares/authMiddleware");

// Public route — MUST be before /:id to avoid conflict
router.get("/share/:token", getSharedItinerary);

// Private routes
router.get("/", protect, getMyItineraries);
router.get("/:id", protect, getItinerary);
router.patch("/:id/share", protect, toggleShare);
router.delete("/:id", protect, deleteItinerary);

module.exports = router;