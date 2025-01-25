// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const postRoutes = require("./routes/posts");
const contactRoutes = require("./routes/contacts");

const app = express();

app.use(
  cors({
    origin: "*", // 개발 중에는 모든 도메인 허용
    methods: ["GET", "POST"],
    credentials: false, // credentials 사용 안 함
  })
);

app.use(express.json());

connectDB();

app.use("/api/posts", postRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
