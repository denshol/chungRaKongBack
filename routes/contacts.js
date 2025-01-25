// routes/contacts.js
const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

router.post("/", async (req, res) => {
  try {
    console.log("Received contact form submission:", req.body);
    const contact = new Contact(req.body);
    const savedContact = await contact.save();
    console.log("Saved contact:", savedContact);
    res.status(201).json(savedContact);
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
