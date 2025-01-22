// middleware/auth.js
const jwt = require("jsonwebtoken");
const { catchAsync } = require("../utils/errorHandler");
const User = require("../models/User");

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "로그인이 필요합니다.",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "유효하지 않은 토큰입니다.",
    });
  }

  req.user = user;
  next();
});
