const twilio = require("twilio");

const sendSMSNotification = async ({ name, email, phone, subject }) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    const message = await client.messages.create({
      body: `새로운 문의가 접수되었습니다.\n이름: ${name}\n연락처: ${phone}\n이메일: ${email}\n제목: ${subject}`,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio 발신번호
      to: process.env.RECIPIENT_PHONE_NUMBER, // 관리자 수신번호
    });

    console.log("SMS sent successfully:", message.sid);
  } catch (error) {
    console.error("SMS sending failed:", error);
    throw new Error("SMS 전송 실패");
  }
};

module.exports = sendSMSNotification;
