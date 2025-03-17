const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Application = require("../models/applicationModel");

// 신청서 제출 API
router.post(
  "/",
  [
    // 유효성 검증
    body("name").notEmpty().withMessage("이름을 입력해주세요"),
    body("phone")
      .matches(/^01[016789]-\d{3,4}-\d{4}$/)
      .withMessage("유효한 전화번호를 입력해주세요"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("유효한 이메일을 입력해주세요"),
    body("programId").notEmpty().withMessage("프로그램을 선택해주세요"),
    body("programTitle").notEmpty().withMessage("프로그램 제목이 필요합니다"),
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
      const {
        name,
        phone,
        email,
        programId,
        programTitle,
        preferredTime,
        companions,
        message,
      } = req.body;

      // 새 신청서 생성
      const newApplication = new Application({
        name,
        phone,
        email,
        programId,
        programTitle,
        preferredTime,
        companions,
        message,
        status: "대기중",
      });

      // DB에 저장
      await newApplication.save();

      // 이메일 알림 전송 (sendEmailNotification 함수는 app.js에 정의됨)
      if (req.app.locals.sendEmailNotification) {
        await req.app.locals.sendEmailNotification({
          name,
          email: email || "이메일 없음",
          phone,
          programTitle,
          message: `선호 시간대: ${preferredTime || "없음"}\n동반 인원: ${
            companions || "없음"
          }\n메시지: ${message || "없음"}`,
        });
      }

      return res.status(201).json({
        success: true,
        message: "프로그램 신청이 성공적으로 접수되었습니다!",
        data: newApplication,
      });
    } catch (error) {
      console.error("❌ 신청서 처리 실패:", error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다" });
    }
  }
);

// 신청 목록 조회 API (관리자용)
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("❌ 신청 목록 조회 실패:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
});

// 신청 상태 변경 API (관리자용)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 유효한 상태값인지 확인
    if (!["대기중", "승인완료", "취소됨"].includes(status)) {
      return res.status(400).json({ message: "유효하지 않은 상태값입니다" });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: "신청서를 찾을 수 없습니다" });
    }

    return res.status(200).json({
      success: true,
      message: "신청 상태가 업데이트되었습니다",
      data: application,
    });
  } catch (error) {
    console.error("❌ 신청 상태 변경 실패:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
});

// 특정 신청서 조회 API
router.get("/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "신청서를 찾을 수 없습니다" });
    }

    return res.status(200).json(application);
  } catch (error) {
    console.error("❌ 신청서 조회 실패:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
});

module.exports = router;
