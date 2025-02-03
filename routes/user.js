const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Contact = require("../models/Contact");
const { protect } = require("../middleware/auth"); // ✅ { protect } 사용하여 함수만 가져오기

// 📌 마이페이지 조회 (사용자 정보)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("마이페이지 조회 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 📌 관리자용 문의 목록 조회
router.get("/contacts", protect, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "관리자만 접근 가능합니다." });
  }

  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("문의 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

module.exports = router;
