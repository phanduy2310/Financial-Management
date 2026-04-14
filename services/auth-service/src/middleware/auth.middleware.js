const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/user.model");

exports.authenticate = async (req, res, next) => {
    console.log("[AUTH]", req.method, req.originalUrl);
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Không có token" });
        }

        const decoded = verifyAccessToken(token);
        // có thể query DB lại để chắc chắn user còn tồn tại
        const user = await User.query().findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User không tồn tại" });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullname: user.fullname,
        };

        next();
    } catch (err) {
        return res
            .status(401)
            .json({ message: "Token không hợp lệ", error: err.message });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Chưa đăng nhập" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Không có quyền truy cập" });
        }

        next();
    };
};
