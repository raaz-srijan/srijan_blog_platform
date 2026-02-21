const jwt = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY;
const JWT_TIMEOUT = process.env.JWT_TIMEOUT;

function generateJWT(payload, expiresIn=JWT_TIMEOUT){
    return jwt.sign(payload, JWT_KEY, {expiresIn});
}

function verifyJWT(token) {
    return jwt.verify(token, JWT_KEY);
}

module.exports = {generateJWT, verifyJWT}