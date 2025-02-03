const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    try {
      token = req.headers.authorization.replace("Bearer ", "").trim();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
      }

      next();
    } catch (error) {
      console.error("토큰 검증 오류:", error);
      res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }
  } else {
    res.status(401).json({ message: "토큰이 제공되지 않았습니다." });
  }
};

module.exports = { protect }; // ✅ { protect }로 내보내야 함
