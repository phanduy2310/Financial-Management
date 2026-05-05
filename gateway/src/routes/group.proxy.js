const express = require("express");
const axios = require("axios");
const { error } = require("../utils/response");

const router = express.Router();
const GROUP_URL = process.env.GROUP_SERVICE_URL;

router.use(async (req, res) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;

    const response = await axios({
      method: req.method,
      url: `${GROUP_URL}${req.originalUrl}`,
      data: req.body,
      headers,
      validateStatus: () => true,
      timeout: 5000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[GROUP PROXY ERROR]", err.message);
    error(res, err.message, 502, "PROXY_ERROR");
  }
});

module.exports = router;
