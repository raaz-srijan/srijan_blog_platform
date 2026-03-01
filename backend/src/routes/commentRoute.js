const express = require("express");
const { addComment, fetchComments, deleteComment } = require("../controllers/commentController");
const { auth } = require("../middlewares/auth");
const { requirePermission } = require("../middlewares/rbacMiddleware");

const router = express.Router({ mergeParams: true });

router.post("/", auth, requirePermission("create_comment"), addComment);
router.get("/", fetchComments);

router.delete("/:commentId", auth, deleteComment);

module.exports = router;