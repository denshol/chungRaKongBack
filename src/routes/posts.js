// backend/routes/posts.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// 게시글 목록 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(10);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시글 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
    // 조회수 증가
    post.views += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시글 작성
// backend/routes/posts.js
router.post("/", async (req, res) => {
  console.log("게시글 작성 요청:", req.body); // 요청 데이터 로그

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author || "익명",
  });

  try {
    const newPost = await post.save();
    console.log("저장된 게시글:", newPost); // 저장된 데이터 로그
    res.status(201).json(newPost);
  } catch (err) {
    console.error("게시글 저장 실패:", err); // 에러 로그
    res.status(400).json({ message: err.message });
  }
});

// 댓글 작성
router.post("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    post.comments.push({
      content: req.body.content,
      author: req.body.author || "익명",
    });

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
