const axios = require("axios");

const BASE_URL = process.env.NOTIFICATION_SERVICE_URL;

/**
 * Publish một notification event tới notification-service
 * Fire-and-forget: không để lỗi notification block luồng chính
 */
exports.publish = (event, user_id, payload) => {
    if (!BASE_URL) return;

    axios
        .post(
            `${BASE_URL}/internal/publish`,
            {
                event,
                user_id,
                channels: ["web"],
                source_service: "saving-service",
                payload,
            },
            {
                headers: { "x-internal-key": process.env.INTERNAL_API_KEY },
            }
        )
        .catch((err) =>
            console.error(
                `[NOTIFY] Failed to publish ${event}:`,
                err.message
            )
        );
};
