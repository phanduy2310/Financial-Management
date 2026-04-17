const crypto = require("crypto");

const { JWT_REFRESH_SECRET } = process.env;

if (!JWT_REFRESH_SECRET) {
    throw new Error("Missing JWT_REFRESH_SECRET in env");
}

function safeEqual(left, right) {
    if (typeof left !== "string" || typeof right !== "string") {
        return false;
    }

    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function hashRefreshToken(token) {
    return crypto
        .createHmac("sha256", JWT_REFRESH_SECRET)
        .update(token)
        .digest("hex");
}

function refreshTokenMatchesStoredValue(token, storedValue) {
    if (typeof token !== "string" || typeof storedValue !== "string") {
        return false;
    }

    if (safeEqual(token, storedValue)) {
        return true;
    }

    return safeEqual(hashRefreshToken(token), storedValue);
}

module.exports = {
    hashRefreshToken,
    refreshTokenMatchesStoredValue,
};
