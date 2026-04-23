const express = require("express");
const axios = require("axios");
const http = require("http");
const { error } = require("../utils/response");

const router = express.Router();
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL;

// SSE stream — dùng http thuần vì axios không support streaming
router.get("/stream", (req, res) => {
  const targetUrl = new URL(`${NOTIFICATION_URL}${req.originalUrl}`);

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || 80,
    path: targetUrl.pathname + targetUrl.search,
    method: "GET",
    headers: {
      Authorization: req.headers.authorization || "",
      Accept: "text/event-stream",
      host: targetUrl.host,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("[SSE PROXY ERROR]", err.message);
    if (!res.headersSent) res.status(502).end();
  });

  req.on("close", () => proxyReq.destroy());

  proxyReq.end();
});

// Các route thông thường
router.use(async (req, res) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;

    const response = await axios({
      method: req.method,
      url: `${NOTIFICATION_URL}${req.originalUrl}`,
      data: req.body,
      headers,
      validateStatus: () => true,
      timeout: 5000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[NOTIFICATION PROXY ERROR]", err.message);
    error(res, err.message, 502, "PROXY_ERROR");
  }
});

module.exports = router;
