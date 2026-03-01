const User = require("../models/userSchema");
const { verifyJWT } = require("../utils/generateToken");

async function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization token",
            });
        }

        const decoded = verifyJWT(token);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = { id: user._id, email: user.email, name: user.name };
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
            error: error.message,
        });
    }
}

async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];
        if (!token) return next();

        let decoded;
        try {
            decoded = verifyJWT(token);
        } catch (err) {
            return next();
        }

        const user = await User.findById(decoded.id).select("-password");
        if (user) {
            req.user = { id: user._id, email: user.email, name: user.name };
        }
        next();
    } catch (error) {
        next();
    }
}

module.exports = { auth, optionalAuth };