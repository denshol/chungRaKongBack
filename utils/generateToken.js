const jwt = require("jsonwebtoken");

// JWT 토큰 생성 함수
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // 30일 유효
  });
};

module.exports = generateToken;
