const DEFAULT_REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const REFRESH_TOKEN_COOKIE_NAME =
    process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

function getRefreshTokenCookieOptions() {
    const options = {
        httpOnly: true,
        secure:
            process.env.COOKIE_SECURE === "true" ||
            process.env.NODE_ENV === "production",
        sameSite: process.env.COOKIE_SAME_SITE || "strict",
        maxAge:
            Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) ||
            DEFAULT_REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
        path: "/",
    };

    if (process.env.COOKIE_DOMAIN) {
        options.domain = process.env.COOKIE_DOMAIN;
    }

    return options;
}

function getRefreshTokenClearCookieOptions() {
    const { maxAge, ...clearOptions } = getRefreshTokenCookieOptions();
    return clearOptions;
}

module.exports = {
    REFRESH_TOKEN_COOKIE_NAME,
    getRefreshTokenCookieOptions,
    getRefreshTokenClearCookieOptions,
};
