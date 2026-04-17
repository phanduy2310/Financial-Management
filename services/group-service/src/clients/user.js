const axios = require("axios");

const BASE_URL = process.env.AUTH_SERVICE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

exports.getListFullNameByUserIds = async (user_ids) => {
    try {
        if (!BASE_URL) {
            return [];
        }

        const response = await axios.post(
            `${BASE_URL}/api/auth/users/bulk`,
            {
                ids: uniqueUserIds
            },
            {
                headers: {
                    "x-internal-key": INTERNAL_API_KEY
                }
            }
        );

        const users = response.data?.users || [];

        return users.map((user) => ({
            id: user.id,
            fullname: user.fullname
        }));
    } catch (err) {
        console.error(
            "[AUTH CLIENT] Failed to getListFullNameByUserIds:",
            err.message
        );
        return [];
    }
};