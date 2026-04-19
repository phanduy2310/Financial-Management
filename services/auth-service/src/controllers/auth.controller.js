const bcrypt = require("bcrypt");
const Joi = require("joi");

const User = require("../models/user.model");
const {
    REFRESH_TOKEN_COOKIE_NAME,
    getRefreshTokenClearCookieOptions,
    getRefreshTokenCookieOptions,
} = require("../config/auth");
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt");
const {
    hashRefreshToken,
    refreshTokenMatchesStoredValue,
} = require("../utils/refresh_token");
const { serializeUser, serializeUsers } = require("../utils/user");

const registerSchema = Joi.object({
    fullname: Joi.string().trim().min(3).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("user", "parent").default("user"),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

function buildAuthPayload(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
    };
}

exports.register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            return res.status(400).json({
                message: "Du lieu khong hop le",
                details: error.details.map((detail) => detail.message),
            });
        }

        const { fullname, email, password, role } = value;

        const existingUser = await User.query().findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email da ton tai" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.query().insert({
            fullname,
            email,
            password: hashedPassword,
            role,
        });

        return res.status(201).json({
            success: true,
            message: "Dang ky thanh cong",
            data: serializeUser(user),
        });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        return res.status(500).json({
            message: "Loi server",
            error: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Du lieu khong hop le",
                details: error.details.map((detail) => detail.message),
            });
        }

        const { email, password } = req.body;
        const user = await User.query().findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Khong tim thay nguoi dung" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Sai mat khau" });
        }

        const payload = buildAuthPayload(user);
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        await User.query().patchAndFetchById(user.id, {
            refresh_token: hashRefreshToken(refreshToken),
        });

        res.cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            refreshToken,
            getRefreshTokenCookieOptions()
        );

        return res.json({
            success: true,
            message: "Dang nhap thanh cong",
            data: {
                user: serializeUser(user),
                accessToken,
            },
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({
            message: "Loi server",
            error: err.message,
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
        if (!tokenFromCookie) {
            return res.status(401).json({ message: "Khong co refresh token" });
        }

        const decoded = verifyRefreshToken(tokenFromCookie);
        const user = await User.query().findById(decoded.id);

        if (
            !user ||
            !refreshTokenMatchesStoredValue(tokenFromCookie, user.refresh_token)
        ) {
            return res.status(401).json({
                message: "Refresh token khong hop le",
            });
        }

        const payload = buildAuthPayload(user);
        const newAccessToken = signAccessToken(payload);
        const newRefreshToken = signRefreshToken(payload);

        await User.query().patchAndFetchById(user.id, {
            refresh_token: hashRefreshToken(newRefreshToken),
        });

        res.cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            newRefreshToken,
            getRefreshTokenCookieOptions()
        );

        return res.json({
            success: true,
            message: "Refresh token thanh cong",
            data: {
                accessToken: newAccessToken,
            },
        });
    } catch (err) {
        console.error("REFRESH TOKEN ERROR:", err);
        return res.status(401).json({
            message: "Refresh token khong hop le",
            error: err.message,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

        if (tokenFromCookie) {
            try {
                const decoded = verifyRefreshToken(tokenFromCookie);
                const user = await User.query()
                    .findById(decoded.id)
                    .select("id", "refresh_token");

                if (
                    user &&
                    refreshTokenMatchesStoredValue(
                        tokenFromCookie,
                        user.refresh_token
                    )
                ) {
                    await User.query().patchAndFetchById(decoded.id, {
                        refresh_token: null,
                    });
                }
            } catch (error) {
                console.warn("LOGOUT TOKEN VERIFY FAILED:", error.message);
            }
        }

        res.clearCookie(
            REFRESH_TOKEN_COOKIE_NAME,
            getRefreshTokenClearCookieOptions()
        );

        return res.json({
            success: true,
            message: "Dang xuat thanh cong",
        });
    } catch (err) {
        console.error("LOGOUT ERROR:", err);
        return res.status(500).json({
            message: "Loi server",
            error: err.message,
        });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await User.query()
            .findById(req.user.id)
            .select("id", "fullname", "email", "role", "created_at");

        if (!user) {
            return res.status(404).json({ message: "Khong tim thay nguoi dung" });
        }

        return res.json({
            success: true,
            data: serializeUser(user),
        });
    } catch (err) {
        console.error("ME ERROR:", err);
        return res.status(500).json({
            message: "Loi server",
            error: err.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.query()
            .findById(req.params.id)
            .select("id", "fullname", "email", "role", "created_at");

        if (!user) {
            return res.status(404).json({ message: "Khong tim thay nguoi dung" });
        }

        return res.json({
            success: true,
            data: serializeUser(user),
        });
    } catch (err) {
        console.error("GET USER ERROR:", err);
        return res.status(500).json({
            message: "Loi server",
            error: err.message,
        });
    }
};

exports.getUsersBulk = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                message: "Danh sach ID khong hop le",
            });
        }

        const users = await User.query()
            .whereIn("id", ids)
            .select("id", "fullname", "email", "role");

        return res.json({
            success: true,
            count: users.length,
            users: serializeUsers(users),
        });
    } catch (err) {
        console.error("BULK USER ERROR:", err);
        return res.status(500).json({
            message: "Loi server",
            error: err.message,
        });
    }
};

exports.findByEmail = async (req, res) => {
    try {
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({ message: "Email khong hop le" });
        }

        const user = await User.query()
            .findOne({ email })
            .select("id", "fullname", "email", "role");

        if (!user) {
            return res.status(404).json({
                message: "Khong tim thay user voi email nay",
            });
        }

        return res.json({
            success: true,
            data: serializeUser(user),
        });
    } catch (err) {
        console.error("FIND USER ERROR:", err);
        return res.status(500).json({
            message: "Loi server",
            error: err.message,
        });
    }
};
