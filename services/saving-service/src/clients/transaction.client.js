const createServiceClient = require("./base.client");

const client = createServiceClient({
    serviceName: "transaction-service",
    baseURL: process.env.TRANSACTION_SERVICE_URL,
});

client.defaults.headers["x-internal-key"] = process.env.INTERNAL_API_KEY;

/**
 * Trả về axios instance với Authorization header được set sẵn.
 * Dùng khi cần forward token từ frontend request xuống transaction-service.
 *
 * @param {string} authToken - Giá trị header Authorization (e.g. "Bearer <jwt>")
 */
client.withAuth = (authToken) => ({
    post: (url, data) =>
        client.post(url, data, { headers: { Authorization: authToken } }),
    get: (url, config) =>
        client.get(url, { ...config, headers: { Authorization: authToken } }),
});

module.exports = client;
