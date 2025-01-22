// controllers/postController.js
const Post = require("../models/Post");
const { catchAsync } = require("../utils/errorHandler");

exports.getAllPosts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .populate("author", "username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments();

  res.status(200).json({
    status: "success",
    data: posts,
    pagination: {
      current: page,
      total: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    },
  });
});

exports.createPost = catchAsync(async (req, res) => {
  const post = await Post.create({
    ...req.body,
    author: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: post,
  });
});

exports.getPost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username")
    .populate("comments.author", "username");

  if (!post) {
    return res.status(404).json({
      status: "fail",
      message: "게시글을 찾을 수 없습니다.",
    });
  }

  // 조회수 증가
  post.views += 1;
  await post.save();

  res.status(200).json({
    status: "success",
    data: post,
  });
});

exports.updatePost = catchAsync(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    {
      _id: req.params.id,
      author: req.user._id,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!post) {
    return res.status(404).json({
      status: "fail",
      message: "게시글을 찾을 수 없거나 권한이 없습니다.",
    });
  }

  res.status(200).json({
    status: "success",
    data: post,
  });
});

exports.deletePost = catchAsync(async (req, res) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });

  if (!post) {
    return res.status(404).json({
      status: "fail",
      message: "게시글을 찾을 수 없거나 권한이 없습니다.",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
