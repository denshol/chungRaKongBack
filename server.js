const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const postRoutes = require("./routes/posts");
const contactRoutes = require("./routes/contacts");

const app = express();

// CORS 설정 단순화
app.use(cors());
app.use(express.json());

connectDB();

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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
