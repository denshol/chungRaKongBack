const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  programTitle: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
