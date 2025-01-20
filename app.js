const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 'uploads' 폴더 생성
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB 연결 성공");
  })
  .catch((err) => {
    console.error("MongoDB 연결 실패:", err);
  });

// 게시글 스키마 정의
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["notice", "event", "review"],
  },
  program: {
    type: String,
    required: true,
  },
  image: String,
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", PostSchema);

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
}).single("image");

// 게시글 작성 API
app.post("/api/posts", (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error("파일 업로드 에러:", err);
        return res
          .status(400)
          .json({ message: "파일 업로드 실패", error: err.message });
      }

      const { title, content, category, program } = req.body;

      // 필수 필드 검증
      if (!title || !content || !category || !program) {
        console.error("누락된 필수 항목:", {
          title,
          content,
          category,
          program,
        });
        return res.status(400).json({
          message: "필수 항목이 누락되었습니다.",
          missing: {
            title: !title,
            content: !content,
            category: !category,
            program: !program,
          },
        });
      }

      const post = new Post({
        title,
        content,
        category,
        program,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      });

      await post.save();
      console.log("게시글 저장 성공:", post);
      res.status(201).json(post);
    } catch (error) {
      console.error("게시글 작성 에러:", error);
      res.status(500).json({
        message: "게시글 작성 실패",
        error: error.message,
        stack: error.stack,
      });
    }
  });
});

// 게시글 목록 조회 API
app.get("/api/posts", async (req, res) => {
  try {
    const { category, program } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (program) filter.program = program;

    const posts = await Post.find(filter).sort("-createdAt").limit(20);

    console.log("게시글 목록 조회 결과:", posts.length);
    res.json(posts);
  } catch (error) {
    console.error("게시글 목록 조회 에러:", error);
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
    console.error("게시글 조회 에러:", error);
    res.status(500).json({ message: "게시글 조회 실패" });
  }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "서버 에러",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
