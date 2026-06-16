const express = require("express");
const router = express.Router();
const { uploadAndGenerate } = require("../controllers/uploadController");
const { protect } = require("../middlewares/authMiddleware");
const { upload } = require("../config/multer");

// Single file upload — field name must be "document"
router.post("/", protect, upload.single("document"), uploadAndGenerate);

module.exports = router;