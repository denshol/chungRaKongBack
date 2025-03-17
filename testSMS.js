const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

(async () => {
  try {
    const message = await client.messages.create({
      body: "📢 테스트 메시지입니다.",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.RECIPIENT_PHONE_NUMBER,
    });
    console.log("✅ 테스트 SMS 전송 성공:", message.sid);
  } catch (error) {
    console.error("❌ 테스트 SMS 전송 실패:", error);
  }
})();
