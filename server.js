// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// MongoDB 연결
mongoose
  .connect("mongodb://localhost:27017/board", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));

// Post 모델 정의
const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "익명",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "익명",
  },
  views: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema);

// server.js GET /api/posts 부분
app.get("/api/posts", async (req, res) => {
  try {
    // 최신순으로 정렬하여 모든 게시글 조회
    const posts = await Post.find().sort({ createdAt: -1 }).exec();

    // 중복 제거를 위해 Set 사용
    const uniquePosts = Array.from(new Set(posts.map((post) => post._id))).map(
      (id) => posts.find((post) => post._id.toString() === id.toString())
    );

    res.json({ data: uniquePosts });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// server.js에서 POST /api/posts 핸들러 수정
app.post("/api/posts", async (req, res) => {
  try {
    // 최근 1초 이내에 동일한 제목으로 작성된 게시글이 있는지 확인
    const recentPost = await Post.findOne({
      title: req.body.title,
      createdAt: { $gt: new Date(Date.now() - 1000) },
    });

    if (recentPost) {
      return res
        .status(400)
        .json({ message: "동일한 게시글이 이미 작성되었습니다." });
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author || "익명",
    });

    const savedPost = await post.save();
    console.log("새 게시글 작성됨:", savedPost);
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// GET /api/posts/:id - 게시글 상세 조회
app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 조회수 증가
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// POST /api/posts/:id/comments - 댓글 작성
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    post.comments.push({
      content: req.body.content,
      author: req.body.author || "익명",
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// PUT /api/posts/:id - 게시글 수정
app.put("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    res.json(post);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// DELETE /api/posts/:id - 게시글 삭제
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// DELETE /api/posts/:id/comments/:commentId - 댓글 삭제
app.delete("/api/posts/:id/comments/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );

    await post.save();
    res.status(204).end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`서버가 ${PORT} 포트에서 실행중입니다.`);
});
