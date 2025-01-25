// models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, default: "익명" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = commentSchema;
