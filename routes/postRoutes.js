// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middleware/auth");
const upload = require("../utils/s3Upload");

router
  .route("/")
  .get(postController.getAllPosts)
  .post(auth.protect, postController.createPost);

router
  .route("/:id")
  .get(postController.getPost)
  .put(auth.protect, postController.updatePost)
  .delete(auth.protect, postController.deletePost);

router.post(
  "/:id/attachments",
  auth.protect,
  upload.array("files", 5),
  postController.uploadAttachments
);

module.exports = router;
