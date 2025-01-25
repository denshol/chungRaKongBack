const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const sendEmailNotification = require("../utils/emailService");
const sendSMSNotification = require("../utils/smsService");

router.post("/", async (req, res) => {
  try {
    console.log("Received contact form submission:", req.body);
    const contact = new Contact(req.body);
    await contact.save();

    // 이메일 및 SMS 알림 전송
    await sendEmailNotification(req.body);
    await sendSMSNotification(req.body);

    res.status(201).json({ message: "문의가 접수되었습니다." });
  } catch (error) {
    console.error("Error processing contact:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
});

module.exports = router;
