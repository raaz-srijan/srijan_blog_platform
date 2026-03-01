const express = require("express");
const {
  addBlog,
  updateBlog,
  deleteBlog,
  fetchOwnedBlog,
  fetchBlogs,
  fetchBlogById
} = require("../controllers/blogController");
const { auth, optionalAuth } = require("../middlewares/auth");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const upload = require("../utils/multer");

const router = express.Router();

router.post("/post", auth, requirePermission("create_post"), upload.multipleImages, addBlog);
router.put("/:blogId", auth, requirePermission("edit_post"), upload.multipleImages, updateBlog);
router.delete("/:blogId", auth, requirePermission("delete_post"), deleteBlog);
router.get("/myblogs", auth, fetchOwnedBlog);

router.get("/", fetchBlogs);
router.get("/:blogId", optionalAuth, fetchBlogById);

module.exports = router;
