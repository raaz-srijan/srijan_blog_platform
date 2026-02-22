const express = require("express");
const { addComment, fetchComments, deleteComment } = require("../controllers/commentController");
const auth = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });

router.post("/", auth, addComment);
router.get("/", fetchComments);

router.delete("/:commentId", auth, deleteComment);

module.exports = router;