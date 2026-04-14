const bcrypt = require("bcrypt");
const Joi = require("joi");
const User = require("../models/user.model");
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt");

// ==== SCHEMAS ====
const registerSchema = Joi.object({
    fullname: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.any().forbidden(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// ==== REGISTER ====
exports.register = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                details: error.details.map((d) => d.message),
            });
        }

        const { fullname, email, password } = req.body;

        const exist = await User.query().findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.query().insert({
            fullname,
            email,
            password: hashed,
            role: "user",
        });

        // Không trả password
        delete user.password;

        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: user,
        });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        return res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
    }
};

// ==== LOGIN ====
exports.login = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                details: error.details.map((d) => d.message),
            });
        }

        const { email, password } = req.body;
        const user = await User.query().findOne({ email });

        if (!user) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy người dùng" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Sai mật khẩu" });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullname: user.fullname,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        // Lưu refresh token vào DB (cần có cột refresh_token trong bảng users)
        await User.query().patchAndFetchById(user.id, {
            refresh_token: refreshToken,
        });

        // Set cookie httpOnly cho refresh token
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // production nên để true + dùng HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        delete user.password;

        return res.json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                user,
                accessToken,
            },
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
    }
};

// ==== REFRESH TOKEN ====
exports.refreshToken = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies.refreshToken;
        if (!tokenFromCookie) {
            return res.status(401).json({ message: "Không có refresh token" });
        }

        // verify refresh token
        const decoded = verifyRefreshToken(tokenFromCookie);

        // check trong DB
        const user = await User.query().findById(decoded.id);
        if (!user || user.refresh_token !== tokenFromCookie) {
            return res
                .status(401)
                .json({ message: "Refresh token không hợp lệ" });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullname: user.fullname,
        };

        const newAccessToken = signAccessToken(payload);
        const newRefreshToken = signRefreshToken(payload);

        // update refresh token trong DB + cookie
        await User.query().patchAndFetchById(user.id, {
            refresh_token: newRefreshToken,
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            message: "Refresh token thành công",
            data: {
                accessToken: newAccessToken,
            },
        });
    } catch (err) {
        console.error("REFRESH TOKEN ERROR:", err);
        return res.status(401).json({
            message: "Refresh token không hợp lệ",
            error: err.message,
        });
    }
};

// ==== LOGOUT ====
exports.logout = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies.refreshToken;

        if (tokenFromCookie) {
            // decode thử để lấy id user (có thể ignore lỗi)
            try {
                const decoded = verifyRefreshToken(tokenFromCookie);
                await User.query().patchAndFetchById(decoded.id, {
                    refresh_token: null,
                });
            } catch (e) {
                // bỏ qua nếu verify fail
            }
        }

        res.clearCookie("refreshToken");

        return res.json({
            success: true,
            message: "Đăng xuất thành công",
        });
    } catch (err) {
        console.error("LOGOUT ERROR:", err);
        return res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
    }
};

// ==== LẤY THÔNG TIN USER HIỆN TẠI ====
exports.me = async (req, res) => {
    try {
        const user = await User.query()
            .findById(req.user.id)
            .select("id", "fullname", "email", "role", "created_at");

        if (!user) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy người dùng" });
        }

        return res.json({
            success: true,
            data: user,
        });
    } catch (err) {
        console.error("ME ERROR:", err);
        return res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.query()
            .findById(req.params.id)
            .select("id", "fullname", "email", "role", "created_at");

        if (!user) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy người dùng" });
        }

        return res.json({ success: true, data: user });
    } catch (err) {
        console.error("GET USER ERROR:", err);
        return res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
    }
};

exports.getUsersBulk = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res
                .status(400)
                .json({ message: "Danh sách ID không hợp lệ" });
        }

        const users = await User.query()
            .whereIn("id", ids)
            .select("id", "fullname", "email", "role");

        return res.json({
            success: true,
            count: users.length,
            users,
        });
    } catch (err) {
        console.error("BULK USER ERROR:", err);
        return res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
    }
};

exports.findByEmail = async (req, res) => {
    try {
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        const user = await User.query()
            .findOne({ email })
            .select("id", "fullname", "email", "role");

        if (!user) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy user với email này" });
        }

        return res.json({ success: true, data: user });
    } catch (err) {
        console.error("FIND USER ERROR:", err);
        return res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
    }
};
