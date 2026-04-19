const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {error} = require("../utils/response");

function hasMatchingInternalKey(providedKey, expectedKey) {
    if (typeof providedKey !== "string" || typeof expectedKey !== "string") {
        return false;
    }

    const providedBuffer = Buffer.from(providedKey);
    const expectedBuffer = Buffer.from(expectedKey);

    if (providedBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function resolveInternalUserId(req) {
    const candidates = [
        req.headers["x-user-id"],
        req.body?.user_id,
        req.query?.user_id,
        req.params?.user_id,
    ];

    for (const candidate of candidates) {
        const parsed = Number(candidate);
        if (Number.isInteger(parsed) && parsed > 0) {
            return parsed;
        }
    }

    return null;
}

function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return error(res, "không có token", 401, "Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // hoặc dùng public key nếu auth-service ký bằng private key

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            fullname: decoded.fullname,
        };

        next();
    } catch (err) {
        return error(res, "Invalid or expired token", 401, "Unauthorized");
    }
}

function authOrInternal(req, res, next) {
    const expectedKey = process.env.INTERNAL_API_KEY;
    const providedKey = req.headers["x-internal-key"];

    if (hasMatchingInternalKey(providedKey, expectedKey)) {
        const userId = resolveInternalUserId(req);

        if (!userId) {
            return error(
                res,
                "internal request thieu user_id",
                400,
                "INVALID_INTERNAL_USER"
            );
        }

        req.user = {
            id: userId,
            role: "internal",
        };

        return next();
    }

    return auth(req, res, next);
}

module.exports = {
    auth,
    authOrInternal,
};
