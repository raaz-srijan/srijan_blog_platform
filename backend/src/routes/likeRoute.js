const express = require("express");
const { likeBlog, unlikeBlog } = require("../controllers/likeController");
const auth = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });

router.post("/", auth, likeBlog);
router.post("/unlike", auth, unlikeBlog);

module.exports = router;