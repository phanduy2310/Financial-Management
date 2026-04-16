const axios = require("axios");

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

// Lấy base URL của notification-service (bỏ phần /api)
const NOTIFICATION_BASE_URL = NOTIFICATION_SERVICE_URL
    ? NOTIFICATION_SERVICE_URL.replace(/\/api\/?$/, "")
    : null;

/**
 * Tạo in-app notification khi phụ huynh mời liên kết con
 * Token được lưu vào data của notification để child dùng khi confirm
 */
exports.sendParentInviteNotification = async ({ parentEmail, childId, token }) => {
    if (!NOTIFICATION_BASE_URL) {
        console.warn("NOTIFICATION_SERVICE_URL not configured. Skipping notification.");
        return;
    }

    await axios.post(
        `${NOTIFICATION_BASE_URL}/internal/publish`,
        {
            event: "PARENT_LINK_REQUEST",
            user_id: childId,
            channels: ["web"],
            source_service: "auth-service",
            payload: {
                parent_email: parentEmail,
                token,
            },
        },
        {
            headers: { "x-internal-key": process.env.INTERNAL_API_KEY },
        }
    );
};
