const nodemailer = require("nodemailer");

const sendEmailNotification = async ({
  name,
  email,
  phone,
  subject,
  message,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail 사용 (다른 서비스도 가능)
    auth: {
      user: process.env.EMAIL_USER, // 환경 변수에서 이메일 계정
      pass: process.env.EMAIL_PASS, // 환경 변수에서 비밀번호
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL, // 관리자의 이메일
    subject: `새로운 문의: ${subject}`,
    text: `이름: ${name}\n이메일: ${email}\n연락처: ${phone}\n내용: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("이메일 전송 실패");
  }
};

module.exports = sendEmailNotification;
