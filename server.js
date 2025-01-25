// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const postRoutes = require("./routes/posts");
const contactRoutes = require("./routes/contacts");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/posts", postRoutes);
app.use("/api/contacts", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
