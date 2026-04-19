const createServiceClient = require("./base.client");

const client = createServiceClient({
    serviceName: "transaction-service",
    baseURL: process.env.TRANSACTION_SERVICE_URL,
});

client.defaults.headers["x-internal-key"] = process.env.INTERNAL_API_KEY;

module.exports = client;
