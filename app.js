// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// 기본 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 라우트
app.use("/api/posts", require("./routes/postRoutes"));

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/board")
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
