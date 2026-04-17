const jwt = require("jsonwebtoken");
const {error} = require("../utils/response");

function authen(req, res, next) {
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

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return error(res, "Unauthorized", 401, "UNAUTHORIZED");
        }

        if (!req.user.role) {
            return error(res, "Role not found", 403, "ROLE_NOT_FOUND");
        }

        if (!roles.includes(req.user.role)) {
            return error(res, "Không đủ quyền", 403, "FORBIDDEN");
        }

        return next();
    };
}

module.exports = authorize;
module.exports = authen;