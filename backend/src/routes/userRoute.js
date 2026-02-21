const express = require('express');
const { register, login, verifyEmail } = require('../controllers/userController');
const router = express.Router();


router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);

module.exports = router;