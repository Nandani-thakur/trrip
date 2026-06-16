const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "image"], required: true },
    mimeType: { type: String, required: true },
    s3Key: { type: String, required: true },    // S3 object key
    s3Url: { type: String, required: true },    // Public/signed URL
    fileSize: { type: Number },                 // in bytes
    extractedText: { type: String, default: "" },
    status: {
      type: String,
      enum: ["uploaded", "extracting", "extracted", "failed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Upload", uploadSchema);