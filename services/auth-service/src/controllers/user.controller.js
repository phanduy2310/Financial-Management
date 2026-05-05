const userService = require("../services/user.service");
const { success, error } = require("../utils/response");
const { serializeUser, serializeUsers } = require("../utils/user");

/**
 * GET /users/me
 * Lấy thông tin user đang đăng nhập (từ JWT).
 */
exports.me = async (req, res) => {
    try {
        const user = await userService.findById(req.user.id);

        if (!user) {
            return error(res, "Khong tim thay nguoi dung", 404);
        }

        return success(res, serializeUser(user));
    } catch (err) {
        console.error("ME ERROR:", err);
        return error(res, "Loi server", 500);
    }
};

/**
 * GET /users/:id
 * Lấy thông tin user theo ID (internal service call).
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await userService.findById(req.params.id);

        if (!user) {
            return error(res, "Khong tim thay nguoi dung", 404);
        }

        return success(res, serializeUser(user));
    } catch (err) {
        console.error("GET USER ERROR:", err);
        return error(res, "Loi server", 500);
    }
};

/**
 * POST /users/bulk
 * Lấy nhiều user theo danh sách ID (internal service call).
 */
exports.getUsersInforBulk = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return error(res, "Danh sach ID khong hop le", 400);
        }

        const users = await userService.findByIds(ids);

        return success(res, { count: users.length, users: serializeUsers(users) });
    } catch (err) {
        console.error("BULK USER ERROR:", err);
        return error(res, "Loi server", 500);
    }
};

/**
 * GET /users/find?email=...
 * Tìm user theo email (client gọi khi add member vào nhóm).
 */
exports.findByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return error(res, "Email khong hop le", 400);
        }

        const user = await userService.findByEmail(email);

        if (!user) {
            return error(res, "Khong tim thay user voi email nay", 404);
        }

        return success(res, serializeUser(user));
    } catch (err) {
        console.error("FIND USER ERROR:", err);
        return error(res, "Loi server", 500);
    }
};
