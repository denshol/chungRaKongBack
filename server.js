const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const applicationRoutes = require("./routes/applicationRoutes");
const postRoutes = require("./routes/posts"); // 필요 시 구현
const contactRoutes = require("./routes/contacts"); // 필요 시 구현
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user"); // 필요 시 구현
const nodemailer = require("nodemailer");


dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json()); // JSON 요청 파싱

// MongoDB 연결
connectDB();

// Nodemailer transporter 설정 (이메일 전송 기능)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail 계정
    pass: process.env.EMAIL_PASS, // Gmail 앱 비밀번호
  },
});

// 이메일 알림 함수
const sendEmailNotification = async ({
  name,
  email,
  phone,
  programTitle,
  message,
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL, // 관리자의 이메일
    subject: `📢 새로운 신청: ${programTitle}`,
    text: `📌 새로운 프로그램 신청이 접수되었습니다.
    
이름: ${name}
이메일: ${email}
전화번호: ${phone}
프로그램명: ${programTitle}
신청 메시지: ${message}
    
확인 후 처리 부탁드립니다.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ 이메일 알림 전송 성공");
  } catch (error) {
    console.error("❌ 이메일 알림 전송 실패:", error);
  }
};

// 신청 저장 및 이메일 전송 API
app.post("/api/applications", async (req, res) => {
  try {
    const { name, email, phone, programTitle, message } = req.body;

    if (!name || !email || !phone || !programTitle) {
      return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    const Application = require("./models/applicationModel");
    const newApplication = new Application({
      name,
      email,
      phone,
      programTitle,
      message,
    });

    await newApplication.save();
    console.log("✅ 신청 데이터 저장 완료:", newApplication);

    // 이메일 알림 전송
    await sendEmailNotification({ name, email, phone, programTitle, message });

    res.status(201).json({
      message: "신청이 성공적으로 접수되었습니다!",
      data: newApplication,
    });
  } catch (error) {
    console.error("❌ 신청 처리 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 문의 저장 및 이메일 전송 API
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // 필수 필드 검증
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    const Contact = require("./models/Contact");
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();
    console.log("✅ 문의 데이터 저장 완료:", newContact);

    // 이메일 알림 전송
    await sendEmailNotification({
      name,
      email,
      phone,
      programTitle: "문의하기",
      message: `제목: ${subject}\n\n내용: ${message}`,
    });

    res.status(201).json({
      message: "문의가 성공적으로 접수되었습니다!",
      data: newContact,
    });
  } catch (error) {
    console.error("❌ 문의 처리 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 신청 목록 조회 API (관리자 확인용)
app.get("/api/applications", async (req, res) => {
  try {
    const Application = require("./models/applicationModel");
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    console.error("❌ 신청 목록 조회 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 문의 목록 조회 API (관리자 전용)
app.get("/api/contact", async (req, res) => {
  try {
    const Contact = require("./models/Contact");
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("❌ 문의 목록 조회 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// API 라우트 설정
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);
app.use("/api/applications", applicationRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "서버 오류 발생" });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
