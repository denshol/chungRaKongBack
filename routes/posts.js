const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// 게시글 목록 조회 (페이지네이션 추가)
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시글 검색 추가
router.get("/search", async (req, res) => {
  const { keyword } = req.query;
  try {
    const posts = await Post.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시글 수정
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    Object.assign(post, req.body);
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 게시글 삭제
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post)
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 댓글 삭제 추가
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );

    await post.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
