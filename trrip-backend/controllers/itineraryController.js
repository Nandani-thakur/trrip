const Itinerary = require("../models/Itinerary");
const { deleteFromS3 } = require("../services/s3Service");
const Upload = require("../models/Upload");

// @desc    Get all itineraries of logged-in user
// @route   GET /api/itineraries
// @access  Private
const getMyItineraries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [itineraries, total] = await Promise.all([
      Itinerary.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-rawAiResponse") // Exclude large raw field
        .populate("upload", "originalName fileType s3Url"),
      Itinerary.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: itineraries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single itinerary by ID (owner only)
// @route   GET /api/itineraries/:id
// @access  Private
const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("upload", "originalName fileType s3Url");

    if (!itinerary) {
      return res.status(404).json({ success: false, message: "Itinerary not found" });
    }

    res.json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shared itinerary by share token (public)
// @route   GET /api/itineraries/share/:token
// @access  Public
const getSharedItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      shareToken: req.params.token,
      isPublic: true,
      status: "completed",
    }).select("-rawAiResponse -shareToken");

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Shared itinerary not found or is not public",
      });
    }

    res.json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle share (make itinerary public/private)
// @route   PATCH /api/itineraries/:id/share
// @access  Private
const toggleShare = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: "Itinerary not found" });
    }

    itinerary.isPublic = !itinerary.isPublic;
    await itinerary.save();

    const shareUrl = itinerary.isPublic
      ? `${process.env.CLIENT_URL}/share/${itinerary.shareToken}`
      : null;

    res.json({
      success: true,
      message: itinerary.isPublic ? "Itinerary is now public" : "Itinerary is now private",
      isPublic: itinerary.isPublic,
      shareUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete itinerary
// @route   DELETE /api/itineraries/:id
// @access  Private
const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: "Itinerary not found" });
    }

    // Also delete the associated upload + S3 file
    if (itinerary.upload) {
      const upload = await Upload.findById(itinerary.upload);
      if (upload) {
        await deleteFromS3(upload.s3Key);
        await upload.deleteOne();
      }
    }

    await itinerary.deleteOne();

    res.json({ success: true, message: "Itinerary deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyItineraries,
  getItinerary,
  getSharedItinerary,
  toggleShare,
  deleteItinerary,
};