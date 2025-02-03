const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// 문의 제출 라우트
router.post("/", async (req, res) => {
  try {
    console.log("📩 Received request data:", req.body);

    const { name, email, phone, subject, message } = req.body;

    // 필수 데이터 검증
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요" });
    }

    // DB에 데이터 저장
    const newContact = new Contact({ name, email, phone, subject, message });
    await newContact.save();

    console.log("✅ Saved contact successfully");

    res.status(201).json({ message: "문의가 성공적으로 접수되었습니다." });
  } catch (error) {
    console.error("❌ Error saving contact:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
});

module.exports = router;
