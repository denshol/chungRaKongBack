const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const postRoutes = require("./routes/posts");
const contactRoutes = require("./routes/contacts");
const sendEmailNotification = require("./utils/emailService");
const sendSMSNotification = require("./utils/smsService");

const app = express();

const corsOptions = {
  origin: "*", // 모든 출처 허용 (보안상 필요시 도메인으로 제한)
  methods: "GET, POST, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

connectDB();

// 문의 처리 라우트
app.post("/api/contact", async (req, res) => {
  try {
    console.log("Received contact form submission:", req.body);
    const { name, email, phone, subject, message } = req.body;

    // 이메일 및 SMS 전송
    await sendEmailNotification({ name, email, phone, subject, message });
    await sendSMSNotification({ name, email, phone, subject });

    res.status(201).json({ message: "문의가 성공적으로 접수되었습니다." });
  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "서버 오류" });
});

app.use("/api/posts", postRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
