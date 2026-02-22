const express = require('express');
const { register, login, verifyEmail, updateAvatar } = require('../controllers/userController');
const router = express.Router();


router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.put("/avatar", auth, upload.single("avatar"), updateAvatar);

module.exports = router;