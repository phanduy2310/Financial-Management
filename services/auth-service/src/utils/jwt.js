const jwt = require("jsonwebtoken");

const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES,
} = process.env;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("Missing JWT_SECRET or JWT_REFRESH_SECRET in env");
}

function signAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES || "15m",
    });
}

function signRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES || "7d",
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
