const express = require("express");
const router = express.Router();
const Application = require("../models/applicationModel"); // ✅ 올바른 경로 확인!

// 신청 저장 API
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, programTitle, message } = req.body;
    if (!name || !email || !phone || !programTitle) {
      return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    // MongoDB에 저장
    const newApplication = new Application({
      name,
      email,
      phone,
      programTitle,
      message,
    });

    await newApplication.save();
    res
      .status(201)
      .json({
        message: "신청이 성공적으로 접수되었습니다!",
        data: newApplication,
      });
  } catch (error) {
    console.error("❌ 신청 처리 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 신청 목록 조회 API (관리자 확인용)
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    console.error("❌ 신청 목록 조회 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

module.exports = router;
