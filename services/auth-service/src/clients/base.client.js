const axios = require("axios");

module.exports = function createServiceClient({ serviceName, baseURL }) {
    if (!baseURL) {
        throw new Error(
            `${serviceName} URL is not configured. Check the service .env.dev file.`
        );
    }

    return axios.create({
        baseURL,
        timeout: Number(process.env.SERVICE_REQUEST_TIMEOUT_MS || 5000),
        headers: {
            "Content-Type": "application/json",
        },
    });
};
