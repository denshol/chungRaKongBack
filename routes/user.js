const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, admin } = require("../middleware/protect");
const fileUpload = require("../utils/fileUpLoad");

// @route   GET /api/user/profile
// @desc    사용자 프로필 가져오기
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(user);
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// @route   PUT /api/user/profile
// @desc    사용자 프로필 업데이트
// @access  Private
router.put(
  "/profile",
  protect,
  fileUpload.single("profileImage"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      // 사용자 정보 업데이트
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      // 프로필 이미지 업데이트
      if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }

      // 비밀번호 변경
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        isAdmin: updatedUser.isAdmin,
        provider: updatedUser.provider,
      });
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  }
);

// @route   POST /api/user/change-password
// @desc    비밀번호 변경
// @access  Private
router.post("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // 현재 비밀번호 확인
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "현재 비밀번호가 올바르지 않습니다." });
    }

    // 새 비밀번호 설정
    user.password = newPassword;
    await user.save();

    res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("비밀번호 변경 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
