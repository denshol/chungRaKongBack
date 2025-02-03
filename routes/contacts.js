const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { protect } = require("../middleware/auth"); // ✅ {} 추가하여 올바르게 가져오기

// 📌 관리자만 문의 목록 조회 가능
router.get("/", protect, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "관리자만 접근 가능합니다." });
  }

  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("❌ 문의 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

module.exports = router;
