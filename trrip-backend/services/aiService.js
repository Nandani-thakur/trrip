const https = require("https");

const ITINERARY_PROMPT = (extractedText) => `
You are a professional travel planner AI. Based on the travel booking information provided below, generate a detailed, day-by-day travel itinerary.

BOOKING INFORMATION:
---
${extractedText}
---

Return ONLY a valid JSON object (no markdown, no explanation) in exactly this format:

{
  "title": "Trip title based on destination",
  "destination": "Main destination city/country",
  "summary": "2-3 sentence trip overview",
  "travelDates": { "from": "YYYY-MM-DD or null", "to": "YYYY-MM-DD or null" },
  "flightDetails": {
    "airline": "airline name or null",
    "flightNumber": "flight number or null",
    "departure": "departure city or null",
    "arrival": "arrival city or null",
    "departureTime": "datetime or null",
    "arrivalTime": "datetime or null"
  },
  "hotelDetails": {
    "name": "hotel name or null",
    "address": "address or null",
    "checkIn": "date or null",
    "checkOut": "date or null"
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD or Day 1",
      "title": "Descriptive day title",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "location": "Specific location",
          "notes": "Helpful tip"
        }
      ]
    }
  ]
}

Rules:
- Always include at least 3 activities per day
- Include meal suggestions
- Add local tips and must-see places
- If info is missing, make smart suggestions for the destination
`;

const generateItinerary = async (extractedText) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: ITINERARY_PROMPT(extractedText) }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: "application/json" }
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            return reject(new Error(response.error.message));
          }
          const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
          // Clean markdown fences if present
          const cleaned = rawText
            .replace(/```json\n?/gi, "")
            .replace(/```\n?/gi, "")
            .trim();
          
          let parsed;
          try {
            parsed = JSON.parse(cleaned);
          } catch(parseErr) {
            // Try to extract valid JSON using regex
            const match = cleaned.match(/\{[\s\S]*\}/);
            if (match) {
              parsed = JSON.parse(match[0]);
            } else {
              throw new Error("Could not parse AI response as JSON");
            }
          }
          resolve({ parsed, raw: rawText });
        } catch (e) {
          reject(new Error("AI returned invalid response: " + e.message));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

module.exports = { generateItinerary };