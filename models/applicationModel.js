const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "이름은 필수 입력사항입니다."],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "전화번호는 필수 입력사항입니다."],
    trim: true,
    match: [/^01[016789]-\d{3,4}-\d{4}$/, "유효한 전화번호 형식이 아닙니다."],
  },
  email: {
    type: String,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "유효한 이메일 형식이 아닙니다."],
  },
  programId: {
    type: String,
    required: [true, "프로그램 ID는 필수 입력사항입니다."],
  },
  programTitle: {
    type: String,
    required: [true, "프로그램 제목은 필수 입력사항입니다."],
    trim: true,
  },
  preferredTime: {
    type: String,
    trim: true,
  },
  companions: {
    type: String,
    default: "0",
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["대기중", "승인완료", "취소됨"],
    default: "대기중",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", ApplicationSchema);
