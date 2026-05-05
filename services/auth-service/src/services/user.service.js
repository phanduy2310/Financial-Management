const bcrypt = require("bcrypt");

const User = require("../models/user.model");

const SALT_ROUNDS = 10;

/**
 * Tìm user theo email, bao gồm password hash (dùng cho login).
 */
async function findByEmailWithPassword(email) {
    return User.query().findOne({ email });
}

/**
 * Tìm user theo email, chỉ trả về public fields (dùng cho lookup).
 */
async function findByEmail(email) {
    return User.query()
        .findOne({ email })
        .select("id", "fullname", "email", "role");
}

/**
 * Tìm user theo ID. Trả về null nếu không tìm thấy.
 */
async function findById(id) {
    return User.query()
        .findById(id)
        .select("id", "fullname", "email", "role", "created_at");
}

/**
 * Tìm user theo ID kèm refresh_token (dùng cho auth flow).
 */
async function findByIdWithToken(id) {
    return User.query()
        .findById(id)
        .select("id", "fullname", "email", "role", "refresh_token");
}

/**
 * Lấy nhiều user theo danh sách ID (internal service call).
 */
async function findByIds(ids) {
    return User.query()
        .whereIn("id", ids)
        .select("id", "fullname", "email", "role");
}

/**
 * Tạo user mới. Password được hash trước khi lưu.
 */
async function createUser({ fullname, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return User.query().insert({ fullname, email, password: hashedPassword, role });
}

/**
 * Kiểm tra password plaintext có khớp với hash không.
 */
async function verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
}

/**
 * Lưu hashed refresh token vào DB (sau login/refresh).
 */
async function saveRefreshToken(userId, hashedToken) {
    return User.query().patchAndFetchById(userId, { refresh_token: hashedToken });
}

/**
 * Xóa refresh token khỏi DB (logout).
 */
async function clearRefreshToken(userId) {
    return User.query().patchAndFetchById(userId, { refresh_token: null });
}

module.exports = {
    findByEmail,
    findByEmailWithPassword,
    findById,
    findByIdWithToken,
    findByIds,
    createUser,
    verifyPassword,
    saveRefreshToken,
    clearRefreshToken,
};
