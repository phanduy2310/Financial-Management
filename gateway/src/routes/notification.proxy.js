const express = require("express");
const axios = require("axios");
const http = require("http");
require("dotenv").config();

const router = express.Router();
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL;

// SSE stream
router.get("/stream", (req, res) => {
  const targetUrl = new URL(`${NOTIFICATION_URL}${req.originalUrl}`);

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || 80,
    path: targetUrl.pathname + targetUrl.search,
    method: "GET",
    headers: {
      ...req.headers,
      host: targetUrl.host,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("[SSE proxy error]", err.message);
    if (!res.headersSent) res.status(502).end();
  });

  req.on("close", () => proxyReq.destroy());

  proxyReq.end();
});

// Other route
router.use(async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${NOTIFICATION_URL}${req.originalUrl}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization,
        host: undefined,
        connection: undefined,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

module.exports = router;
