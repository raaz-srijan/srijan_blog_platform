const express = require('express');
const {
    register, login, verifyEmail, updateAvatar, forgotPassword, resetPassword,
    getMe, refreshToken, updateProfile, getAllUsers, updateUserRole, googleLogin
} = require('../controllers/userController');
const { auth } = require("../middlewares/auth");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { authLimiter } = require("../middlewares/rateLimiter");
const upload = require("../utils/multer");
const router = express.Router();


router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/google-login", authLimiter, googleLogin);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);
router.post("/refresh-token", refreshToken);

router.get("/me", auth, getMe);
router.put("/profile", auth, updateProfile);
router.put("/avatar", auth, upload.single("avatar"), updateAvatar);

router.get("/", auth, requirePermission("view_users"), getAllUsers);
router.put("/:userId/role", auth, requirePermission("assign_roles"), updateUserRole);

module.exports = router;