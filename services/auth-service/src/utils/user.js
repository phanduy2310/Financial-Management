const SAFE_USER_FIELDS = [
    "id",
    "fullname",
    "email",
    "role",
    "created_at",
    "updated_at",
];

function serializeUser(user) {
    if (!user) {
        return null;
    }

    return SAFE_USER_FIELDS.reduce((result, field) => {
        if (typeof user[field] !== "undefined") {
            result[field] = user[field];
        }

        return result;
    }, {});
}

function serializeUsers(users) {
    if (!Array.isArray(users)) {
        return [];
    }

    return users.map(serializeUser);
}

module.exports = {
    serializeUser,
    serializeUsers,
};
