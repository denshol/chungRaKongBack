const express = require("express");
const router = express.Router();
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/protect");
const fileUpload = require("../utils/fileUpLoad");

// @route   POST /api/auth/register
// @desc    회원가입
// @access  Public
router.post(
  "/register",
  fileUpload.single("profileImage"),
  async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      // 이메일 중복 체크
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      // 프로필 이미지 경로
      const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

      // 사용자 생성
      const user = await User.create({
        name,
        email,
        password,
        phone,
        profileImage,
        provider: "email",
      });

      // 토큰 생성
      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          isAdmin: user.isAdmin,
          provider: user.provider,
        },
      });
    } catch (error) {
      console.error("회원가입 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  }
);

// @route   POST /api/auth/login
// @desc    로그인
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 확인
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 비밀번호 확인
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 토큰 생성
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isAdmin: user.isAdmin,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// @route   POST /api/auth/kakao
// @desc    카카오 로그인
// @access  Public
router.post("/kakao", async (req, res) => {
  try {
    const { kakaoId, email, name, profileImage } = req.body;

    // 카카오 ID로 사용자 찾기
    let user = await User.findOne({ kakaoId });

    if (!user) {
      // 이메일로 기존 사용자 찾기
      if (email) {
        user = await User.findOne({ email });
      }

      // 사용자가 없으면 새로 생성
      if (!user) {
        user = await User.create({
          name,
          email,
          kakaoId,
          profileImage,
          provider: "kakao",
        });
      } else {
        // 기존 사용자에 카카오 ID 연결
        user.kakaoId = kakaoId;
        user.provider = "kakao";
        if (!user.profileImage && profileImage) {
          user.profileImage = profileImage;
        }
        await user.save();
      }
    }

    // 토큰 생성
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isAdmin: user.isAdmin,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("카카오 로그인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
