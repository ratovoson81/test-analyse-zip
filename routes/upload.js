const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const uploadController = require("./../controllers/uploadController");

// Configurer le dossier temporaire pour les ZIP
const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.post("/", upload.single("zipFile"), uploadController.handleUpload);

module.exports = router;
