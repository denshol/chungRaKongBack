// utils/smsNotification.js
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * SMS 알림 전송 함수
 * @param {object} param0 - SMS에 포함할 정보
 * @param {string} param0.name - 신청자 이름
 * @param {string} param0.email - 신청자 이메일
 * @param {string} param0.phone - 신청자 전화번호 (확인 SMS 전송용)
 * @param {string} param0.programTitle - 프로그램 제목
 * @param {string} [param0.message] - 신청 메시지 (옵션)
 */
const sendSMSNotification = async ({
  name,
  email,
  phone,
  programTitle,
  message,
}) => {
  try {
    // 관리자에게 전송할 SMS 메시지
    const adminSMS = `[프로그램 신청 알림]
프로그램: ${programTitle}
신청자: ${name}
연락처: ${phone}
이메일: ${email}
메시지: ${message || "없음"}`;

    // 관리자 SMS 전송 (RECIPIENT_PHONE_NUMBER 환경변수에 관리자 번호를 설정)
    const adminResponse = await client.messages.create({
      body: adminSMS,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.RECIPIENT_PHONE_NUMBER,
    });
    console.log("✅ 관리자 SMS 알림 전송 성공:", adminResponse.sid);

    // 신청자에게 전송할 확인 SMS 메시지 (옵션)
    const userSMS = `[${programTitle} 신청 확인]
${name}님, 프로그램 신청이 접수되었습니다.
빠른 시일 내에 연락드리겠습니다.
감사합니다.`;

    const userResponse = await client.messages.create({
      body: userSMS,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone, // 신청자가 입력한 번호로 전송 (국제번호 형식 필요)
    });
    console.log("✅ 신청자 SMS 알림 전송 성공:", userResponse.sid);

    return {
      adminMessageId: adminResponse.sid,
      userMessageId: userResponse.sid,
    };
  } catch (error) {
    console.error("❌ SMS 알림 전송 실패:", error);
    throw new Error(`SMS 전송 실패: ${error.message}`);
  }
};

module.exports = { sendSMSNotification };
