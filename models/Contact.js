// models/Contact.js
const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "이름은 필수 입력사항입니다."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "이메일은 필수 입력사항입니다."],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "유효한 이메일 형식이 아닙니다."],
  },
  phone: {
    type: String,
    required: [true, "연락처는 필수 입력사항입니다."],
    trim: true,
    match: [/^01[016789]-?\d{3,4}-?\d{4}$/, "유효한 전화번호 형식이 아닙니다."],
  },
  subject: {
    type: String,
    required: [true, "제목은 필수 입력사항입니다."],
    trim: true,
  },
  message: {
    type: String,
    required: [true, "문의 내용은 필수 입력사항입니다."],
  },
  status: {
    type: String,
    enum: ["확인중", "답변완료"],
    default: "확인중",
  },
  response: {
    text: String,
    respondedAt: Date,
    respondedBy: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", ContactSchema);
