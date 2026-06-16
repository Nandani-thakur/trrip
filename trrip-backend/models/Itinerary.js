const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upload: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
    title: { type: String, required: true },

    // Structured itinerary from Gemini
    destination: { type: String },
    travelDates: {
      from: { type: Date },
      to: { type: Date },
    },
    days: [
      {
        day: { type: Number },
        date: { type: String },
        title: { type: String },
        activities: [
          {
            time: { type: String },
            activity: { type: String },
            location: { type: String },
            notes: { type: String },
          },
        ],
      },
    ],
    flightDetails: {
      airline: String,
      flightNumber: String,
      departure: String,
      arrival: String,
      departureTime: String,
      arrivalTime: String,
    },
    hotelDetails: {
      name: String,
      address: String,
      checkIn: String,
      checkOut: String,
    },
    summary: { type: String },             // Short AI-generated summary
    rawAiResponse: { type: String },       // Full raw response for debugging

    // Sharing
    shareToken: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    isPublic: { type: Boolean, default: false },

    // Status
    status: {
      type: String,
      enum: ["generating", "completed", "failed"],
      default: "generating",
    },
  },
  { timestamps: true }
);

// Index for faster queries
itinerarySchema.index({ user: 1, createdAt: -1 });


module.exports = mongoose.model("Itinerary", itinerarySchema);