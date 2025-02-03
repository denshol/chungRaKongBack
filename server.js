const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const postRoutes = require("./routes/posts"); // ✅ 복구
const contactRoutes = require("./routes/contacts");

const app = express();

// CORS 설정
const corsOptions = {
  origin: "*",
  methods: "GET, POST, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// MongoDB 연결
connectDB();

// API 라우트 설정
app.use("/api/posts", postRoutes); // ✅ 복구된 부분
app.use("/api/contact", contactRoutes);

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
