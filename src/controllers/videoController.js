// src/controllers/videoController.js
const Video = require("../models/Video");

exports.uploadVideo = async (req, res) => {
  try {
    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      fileName: req.file.filename,
      user: req.user.userId,
    });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: "비디오 업로드 실패" });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort("-uploadDate")
      .populate("user", "username");
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "비디오 목록 조회 실패" });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "user",
      "username"
    );
    if (!video) {
      return res.status(404).json({ message: "비디오를 찾을 수 없습니다." });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "비디오 조회 실패" });
  }
};
