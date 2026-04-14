const crypto = require("crypto");
const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/user.model");

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

exports.authenticate = async (req, res, next) => {
    console.log("[AUTH]", req.method, req.originalUrl);
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Khong co token" });
        }

        const decoded = verifyAccessToken(token);
        const user = await User.query().findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User khong ton tai" });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullname: user.fullname,
        };

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Token khong hop le",
            error: err.message,
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Chua dang nhap" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Khong co quyen truy cap" });
        }

        next();
    };
};

exports.requireInternalKey = (req, res, next) => {
    const expectedKey = process.env.INTERNAL_API_KEY;
    const providedKey = req.headers["x-internal-key"];

    if (!expectedKey) {
        console.error("INTERNAL_API_KEY is not configured");
        return res.status(500).json({
            message: "Internal API authentication is not configured",
        });
    }

    if (!hasMatchingInternalKey(providedKey, expectedKey)) {
        return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    next();
};
