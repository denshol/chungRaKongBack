// src/routes/videos.js
const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  getVideos,
  getVideo,
} = require("../controllers/videoController");
const authenticateToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", authenticateToken, upload.single("video"), uploadVideo);
router.get("/", authenticateToken, getVideos);
router.get("/:id", authenticateToken, getVideo);

module.exports = router;
