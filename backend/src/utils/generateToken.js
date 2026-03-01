const jwt = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY;
const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;
const JWT_TIMEOUT = process.env.JWT_TIMEOUT
const JWT_REFRESH_TIMEOUT = process.env.JWT_REFRESH_TIMEOUT

function generateJWT(payload, expiresIn = JWT_TIMEOUT) {
    return jwt.sign(payload, JWT_KEY, { expiresIn });
}

function generateRefreshJWT(payload, expiresIn = JWT_REFRESH_TIMEOUT) {
    return jwt.sign(payload, JWT_REFRESH_KEY, { expiresIn });
}

function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_KEY);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}

function verifyRefreshJWT(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_KEY);
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
}

module.exports = {
    generateJWT,
    generateRefreshJWT,
    verifyJWT,
    verifyRefreshJWT
};