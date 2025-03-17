// routes/contact.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Contact = require("../models/Contact"); // MongoDB 모델 가정

// 문의 등록 API
router.post(
  "/contact",
  [
    // 유효성 검증
    body("name").notEmpty().withMessage("이름을 입력해주세요"),
    body("email").isEmail().withMessage("유효한 이메일을 입력해주세요"),
    body("phone")
      .matches(/^01[016789]-?\d{3,4}-?\d{4}$/)
      .withMessage("유효한 전화번호를 입력해주세요"),
    body("subject").notEmpty().withMessage("제목을 입력해주세요"),
    body("message").notEmpty().withMessage("문의 내용을 입력해주세요"),
  ],
  async (req, res) => {
    // 유효성 검증 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    try {
      // 받은 데이터로 새 문의 생성
      const newContact = new Contact({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        subject: req.body.subject,
        message: req.body.message,
        status: "확인중", // 기본 상태
        createdAt: new Date(),
      });

      // DB에 저장
      const savedContact = await newContact.save();

      // 이메일 알림 발송 (선택 사항)
      // await sendNotificationEmail(savedContact);

      return res.status(201).json(savedContact);
    } catch (error) {
      console.error("Contact creation error:", error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다" });
    }
  }
);

// 문의 목록 조회 API
router.get("/inquiries", async (req, res) => {
  try {
    const inquiries = await Contact.find()
      .sort({ createdAt: -1 }) // 최신순 정렬
      .select("-__v"); // 불필요한 필드 제외

    return res.status(200).json(inquiries);
  } catch (error) {
    console.error("Get inquiries error:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
});

module.exports = router;
