// utils/emailNotification.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // 환경 변수에 설정된 이메일 계정
    pass: process.env.EMAIL_PASS, // 환경 변수에 설정된 비밀번호
  },
});

const sendEmailNotification = async ({
  name,
  email,
  phone,
  programTitle,
  message,
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL, // 관리자의 이메일 주소
    subject: `📢 새로운 신청: ${programTitle}`,
    text: `📌 새로운 프로그램 신청이 접수되었습니다.
    
이름: ${name}
이메일: ${email}
전화번호: ${phone}
프로그램명: ${programTitle}
신청 메시지: ${message}
    
확인 후 처리 부탁드립니다.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ 이메일 알림 전송 성공");
  } catch (error) {
    console.error("❌ 이메일 알림 전송 실패:", error);
    throw new Error("이메일 전송 실패");
  }
};

module.exports = { sendEmailNotification };
