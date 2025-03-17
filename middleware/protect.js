const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 인증 미들웨어
exports.protect = async (req, res, next) => {
  let token;

  // 헤더에서 토큰 확인
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 토큰 가져오기
      token = req.headers.authorization.split(" ")[1];

      // 토큰 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 사용자 정보 가져오기 (비밀번호 제외)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error("인증 오류:", error);
      res.status(401).json({ message: "인증이 유효하지 않습니다." });
    }
  }

  if (!token) {
    res.status(401).json({ message: "인증 토큰이 없습니다." });
  }
};

// 관리자 권한 확인 미들웨어
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }
};
