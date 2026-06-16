const path = require("path");
const Upload = require("../models/Upload");
const Itinerary = require("../models/Itinerary");
const { extractTextFromFile } = require("../services/extractService");
const { generateItinerary } = require("../services/aiService");

// @desc    Upload travel document & generate itinerary
// @route   POST /api/upload
// @access  Private
const uploadAndGenerate = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { originalname, mimetype, size, filename, path: filePath } = req.file;
    const fileType = mimetype === "application/pdf" ? "pdf" : "image";
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    //  Save upload record
    const upload = await Upload.create({
      user: req.user._id,
      originalName: originalname,
      fileType,
      mimeType: mimetype,
      s3Key: filename,        // local filename
      s3Url: fileUrl,         // local URL
      fileSize: size,
      status: "extracting",
    });

    //  Extract text
    let extractedText = "";
    try {
      extractedText = await extractTextFromFile(filePath, mimetype);
      upload.extractedText = extractedText;
      upload.status = "extracted";
      await upload.save();
    } catch (extractError) {
      upload.status = "failed";
      await upload.save();
      return res.status(422).json({
        success: false,
        message: `Could not extract text: ${extractError.message}`,
      });
    }

    if (!extractedText || extractedText.length < 20) {
      return res.status(422).json({
        success: false,
        message: "Document appears empty or unreadable. Please upload a clearer file.",
      });
    }

    //  Create placeholder itinerary
    const itinerary = await Itinerary.create({
      user: req.user._id,
      upload: upload._id,
      title: "Generating...",
      status: "generating",
    });

    //  Generate AI itinerary
    try {
      const { parsed, raw } = await generateItinerary(extractedText);

      itinerary.title = parsed.title || "My Travel Itinerary";
      itinerary.destination = parsed.destination;
      itinerary.summary = parsed.summary;
      itinerary.travelDates = parsed.travelDates;
      itinerary.flightDetails = parsed.flightDetails;
      itinerary.hotelDetails = parsed.hotelDetails;
      itinerary.days = parsed.days || [];
      itinerary.rawAiResponse = raw;
      itinerary.status = "completed";
      await itinerary.save();
    } catch (aiError) {
      itinerary.status = "failed";
      await itinerary.save();
      return res.status(500).json({
        success: false,
        message: `AI generation failed: ${aiError.message}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Itinerary generated successfully!",
      data: { upload, itinerary },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAndGenerate };