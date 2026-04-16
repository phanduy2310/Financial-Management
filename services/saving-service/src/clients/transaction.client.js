const createServiceClient = require("./base.client");

module.exports = createServiceClient({
    serviceName: "transaction-service",
    baseURL: process.env.TRANSACTION_SERVICE_URL,
});
