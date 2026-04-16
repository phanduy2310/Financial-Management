const jwt = require("jsonwebtoken");
const {error} = require("../utils/response");

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

module.exports = auth;