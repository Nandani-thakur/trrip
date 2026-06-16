const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

/**
 * Extract text from PDF
 */
const extractFromPDF = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from image using Tesseract OCR
 */
const extractFromImage = async (filePath) => {
  try {
    const { data } = await Tesseract.recognize(filePath, "eng", {
      logger: () => {},
    });
    return data.text?.trim() || "";
  } catch (error) {
    throw new Error(`Image OCR failed: ${error.message}`);
  }
};

/**
 * Main extraction — handles PDF and images
 */
const extractTextFromFile = async (filePath, mimeType) => {
  if (mimeType === "application/pdf") {
    return await extractFromPDF(filePath);
  } else if (mimeType.startsWith("image/")) {
    return await extractFromImage(filePath);
  } else {
    throw new Error("Unsupported file type");
  }
};

module.exports = { extractTextFromFile };