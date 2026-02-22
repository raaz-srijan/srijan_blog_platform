const express = require("express");
const {
  addBlog,
  updateBlog,
  deleteBlog,
  fetchOwnedBlog,
} = require("../controllers/blogController");
const auth = require("../middlewares/auth");
const upload = require("../utils/multer");

const router = express.Router();

router.post("/post", auth, upload.multipleImages, addBlog);
router.put("/:blogId", auth, upload.multipleImages, updateBlog);

router.delete("/:blogId", auth, deleteBlog);

router.get("/myblogs", auth, fetchOwnedBlog);

module.exports = router;
