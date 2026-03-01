const User = require("../models/userSchema");
const Role = require("../models/roleSchema");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT, generateRefreshJWT } = require("../utils/generateToken");
const { deleteImagefromCloudinary, uploadImage } = require("../utils/uploadImage");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/sendEmail");
const { getPaginationOptions, getPaginationMetaData } = require("../utils/pagination");
const { OAuth2Client } = require("google-auth-library")

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });

        const normalizedEmail = email.toLowerCase();

        const existUser = await User.findOne({ email: normalizedEmail });

        if (existUser)
            return res.status(409).json({ success: false, message: "User already registered with this email" });

        if (password.length < 6)
            return res.status(400).json({ success: false, message: "Password must be at least six characters" });

        const hashedPassword = await bcrypt.hash(password, 12);

        const defaultRole = await Role.findOne({ name: "user" });
        if (!defaultRole)
            return res.status(404).json({ success: false, message: "Invalid role" });

        const newUser = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword, isVerified: false, roleId: defaultRole._id });

        const token = generateJWT({ id: newUser._id, email: newUser.email });
        await sendVerificationEmail(newUser.email, token);
        return res.status(201).json({ success: true, message: "User registered successfully. Please check your email to verify.", token });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function verifyEmail(req, res) {
    try {
        const { token } = req.params;
        if (!token)
            return res.status(400).json({ success: false, message: "Invalid or expired token" });

        let decoded;
        try {
            decoded = verifyJWT(token);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        const user = await User.findById(decoded.id);

        if (!user)
            return res.status(404).json({ success: false, message: "Invalid user" });

        if (user.isVerified)
            return res.status(400).json({ success: false, message: "Email is already verified" });

        user.isVerified = true;
        await user.save();

        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}


async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });

        const existUser = await User.findOne({ email: email.toLowerCase() }).populate('roleId');

        if (!existUser)
            return res.status(404).json({ success: false, message: "Incorrect email or password" });

        if (!existUser.isVerified) {
            const verificationToken = generateJWT({ id: existUser._id, email: existUser.email });
            await sendVerificationEmail(existUser.email, verificationToken);
            return res.status(403).json({ success: false, message: "Email is not verified. A new verification link has been sent to your email." });
        }

        const isMatch = await bcrypt.compare(password, existUser.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: "Incorrect email or password" });

        const token = generateJWT({ id: existUser._id, email: existUser.email, role: existUser.roleId?.name });
        const refreshToken = generateRefreshJWT({ id: existUser._id, email: existUser.email, role: existUser.roleId?.name });

        return res.status(200).json({ success: true, message: "Login successfully", token, refreshToken });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}



async function updateAvatar(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        if (!req.file) return res.status(400).json({ success: false, message: "No avatar uploaded" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.avatar) {
            await deleteImagefromCloudinary(user.avatar.public_id);
        }

        const result = await uploadImage(req.file.path);

        user.avatar = { url: result.secure_url, public_id: result.public_id };
        await user.save();

        return res.status(200).json({ success: true, message: "Avatar updated", avatar: user.avatar });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(200).json({ success: true, message: "If an account exists, a reset link has been sent" });
        }

        const resetToken = generateJWT({ id: user._id, type: "password_reset" }, "15m");
        await sendPasswordResetEmail(user.email, resetToken);

        return res.status(200).json({ success: true, message: "If an account exists, a reset link has been sent" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) return res.status(400).json({ success: false, message: "Reset token missing" });
        if (!password || password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least six characters" });

        let decoded;
        try {
            decoded = verifyJWT(token);
            if (decoded.type !== "password_reset") throw new Error("Invalid token type");
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getMe(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const user = await User.findById(userId)
            .select("-password")
            .populate({
                path: 'roleId',
                populate: { path: 'permissions', model: 'Permission' }
            });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function refreshToken(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token is required" });

        let decoded;
        try {
            decoded = verifyRefreshJWT(refreshToken);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
        }

        const user = await User.findById(decoded.id).populate("roleId");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const newAccessToken = generateJWT({ id: user._id, email: user.email, role: user.roleId?.name });

        return res.status(200).json({ success: true, token: newAccessToken });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const { name, email } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        let isEmailChanged = false;

        if (name && name.trim().length > 0) {
            user.name = name.trim();
        }

        if (email) {
            const normalizedEmail = email.trim().toLowerCase();
            if (normalizedEmail !== user.email) {
                const existingAccount = await User.findOne({ email: normalizedEmail });
                if (existingAccount) {
                    return res.status(409).json({ success: false, message: "Email is already in use by another account" });
                }
                user.email = normalizedEmail;
                user.isVerified = false;
                isEmailChanged = true;
            }
        }

        await user.save();

        if (isEmailChanged) {
            const verificationToken = generateJWT({ id: user._id, email: user.email });
            await sendVerificationEmail(user.email, verificationToken);
        }

        const safeUser = await User.findById(userId).select("-password").populate("roleId", "name level");

        return res.status(200).json({
            success: true,
            message: isEmailChanged ? "Profile updated! Please check your new email inbox to verify the change." : "Profile updated successfully",
            user: safeUser
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        const { page, limit, skip } = getPaginationOptions(req, 10);
        const { search } = req.query;

        let query = {};
        if (search) {
            query.email = { $regex: search, $options: "i" };
        }

        const users = await User.find(query)
            .select("-password")
            .populate("roleId", "name level")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);
        const meta = getPaginationMetaData(total, limit, page);

        return res.status(200).json({ success: true, count: users.length, ...meta, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updateUserRole(req, res) {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;

        if (!roleId) return res.status(400).json({ success: false, message: "Role ID is required" });

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ success: false, message: "Invalid role id" });

        const user = await User.findByIdAndUpdate(userId, { roleId: role._id }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, message: "User role updated successfully", user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}


async function googleLogin(req, res) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Missing Google credential",
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { name, email, email_verified, picture } = payload;

        if (!email_verified) {
            return res.status(400).json({
                success: false,
                message: "Google email not verified",
            });
        }

        const normalizedEmail = email.toLowerCase();

        const defaultRole = await Role.findOne({ name: "user" });
        if (!defaultRole) {
            return res.status(400).json({
                success: false,
                message: "Invalid role configuration",
            });
        }

        let user = await User.findOne({ email: normalizedEmail }).populate('roleId');

        if (user && user.provider && user.provider !== "google") {
            return res.status(400).json({
                success: false,
                message: "Email already registered with password login",
            });
        }

        if (!user) {
            user = await User.create({
                name,
                email: normalizedEmail,
                provider: "google",
                roleId: defaultRole._id,
                isVerified: true,
            });

            user.roleId = defaultRole;
        }

        const token = generateJWT({
            id: user._id,
            email: user.email,
            role: user.roleId?.name,
        });

        const refreshToken = generateRefreshJWT({
            id: user._id,
            email: user.email,
            role: user.roleId?.name,
        });

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            refreshToken
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}


module.exports = {
    register, verifyEmail, login, updateAvatar, forgotPassword, resetPassword,
    getMe, refreshToken, updateProfile, getAllUsers, updateUserRole, googleLogin
}