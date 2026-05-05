const Joi = require("joi");

const userService = require("../services/user.service");
const { success, error } = require("../utils/response");
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
const { serializeUser } = require("../utils/user");

// ─── Validation schemas ────────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildAuthPayload(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
    };
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
    try {
        const { error: validationError, value } = registerSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (validationError) {
            return error(res, "Du lieu khong hop le", 400, validationError.details.map((d) => d.message));
        }

        const existing = await userService.findByEmail(value.email);
        if (existing) {
            return error(res, "Email da ton tai", 400);
        }

        const user = await userService.createUser(value);

        return success(res, serializeUser(user), "Dang ky thanh cong", 201);
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        return error(res, "Loi server", 500);
    }
};

exports.login = async (req, res) => {
    try {
        const { error: validationError } = loginSchema.validate(req.body);
        if (validationError) {
            return error(res, "Du lieu khong hop le", 400, validationError.details.map((d) => d.message));
        }

        const { email, password } = req.body;

        const user = await userService.findByEmailWithPassword(email);
        if (!user) {
            return error(res, "Khong tim thay nguoi dung", 404);
        }

        const valid = await userService.verifyPassword(password, user.password);
        if (!valid) {
            return error(res, "Sai mat khau", 401);
        }

        const payload = buildAuthPayload(user);
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        await userService.saveRefreshToken(user.id, hashRefreshToken(refreshToken));

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());

        return success(res, { user: serializeUser(user), accessToken }, "Dang nhap thanh cong");
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return error(res, "Loi server", 500);
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
        if (!tokenFromCookie) {
            return error(res, "Khong co refresh token", 401);
        }

        const decoded = verifyRefreshToken(tokenFromCookie);
        const user = await userService.findByIdWithToken(decoded.id);

        if (!user || !refreshTokenMatchesStoredValue(tokenFromCookie, user.refresh_token)) {
            return error(res, "Refresh token khong hop le", 401);
        }

        const payload = buildAuthPayload(user);
        const newAccessToken = signAccessToken(payload);
        const newRefreshToken = signRefreshToken(payload);

        await userService.saveRefreshToken(user.id, hashRefreshToken(newRefreshToken));

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, getRefreshTokenCookieOptions());

        return success(res, { accessToken: newAccessToken }, "Refresh token thanh cong");
    } catch (err) {
        console.error("REFRESH TOKEN ERROR:", err);
        return error(res, "Refresh token khong hop le", 401);
    }
};

exports.logout = async (req, res) => {
    try {
        const tokenFromCookie = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

        if (tokenFromCookie) {
            try {
                const decoded = verifyRefreshToken(tokenFromCookie);
                const user = await userService.findByIdWithToken(decoded.id);

                if (user && refreshTokenMatchesStoredValue(tokenFromCookie, user.refresh_token)) {
                    await userService.clearRefreshToken(decoded.id);
                }
            } catch (tokenErr) {
                // Token hết hạn hoặc không hợp lệ — vẫn clear cookie bình thường
                console.warn("LOGOUT TOKEN VERIFY FAILED:", tokenErr.message);
            }
        }

        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenClearCookieOptions());

        return success(res, null, "Dang xuat thanh cong");
    } catch (err) {
        console.error("LOGOUT ERROR:", err);
        return error(res, "Loi server", 500);
    }
};
