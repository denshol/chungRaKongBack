const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const Joi = require("joi");
const winston = require("winston");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 로깅 설정
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// 'uploads' 폴더 생성
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 미들웨어 설정
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB 연결 성공"))
  .catch((err) => logger.error("MongoDB 연결 실패:", err));

// 게시글 스키마 정의
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["notice", "event", "review"],
  },
  program: { type: String, required: true },
  image: String,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", PostSchema);

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

// Joi 스키마 (입력 검증)
const postSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  category: Joi.string().valid("notice", "event", "review").required(),
  program: Joi.string().required(),
});

// 게시글 작성 API
app.post("/api/posts", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.error("파일 업로드 에러:", err);
      return res
        .status(400)
        .json({ message: "파일 업로드 실패", error: err.message });
    }

    const { error } = postSchema.validate(req.body);
    if (error) {
      logger.warn("입력 검증 실패:", error.details);
      return res
        .status(400)
        .json({ message: "유효하지 않은 입력값", error: error.details });
    }

    try {
      const { title, content, category, program } = req.body;

      const post = new Post({
        title,
        content,
        category,
        program,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      });

      await post.save();
      logger.info("게시글 저장 성공:", post);
      res.status(201).json(post);
    } catch (error) {
      logger.error("게시글 작성 에러:", error);
      res.status(500).json({ message: "게시글 작성 실패" });
    }
  });
});

// 게시글 목록 조회 API (페이징 적용)
app.get("/api/posts", async (req, res) => {
  try {
    const { category, program, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (program) filter.program = program;

    const posts = await Post.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(posts);
  } catch (error) {
    logger.error("게시글 목록 조회 에러:", error);
    res.status(500).json({ message: "게시글 목록 조회 실패" });
  }
});

// 특정 게시글 조회 API
app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    post.views += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    logger.error("게시글 조회 에러:", error);
    res.status(500).json({ message: "게시글 조회 실패" });
  }
});

// 기본 루트 라우트 (서버 확인용)
app.get("/", (req, res) => {
  res.send("서버가 정상적으로 실행 중입니다.");
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  logger.error("서버 에러:", err);
  res.status(500).json({
    message: "서버 에러",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 서버 실행
app.listen(port, () => {
  logger.info(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
