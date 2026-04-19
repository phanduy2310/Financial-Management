const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const GROUP_URL = process.env.GROUP_SERVICE_URL;

router.use(async (req, res) => {
  try {
    const targetUrl = `${GROUP_URL}${req.originalUrl}`;
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization,
        host: undefined,
        connection: undefined,
      },
      data: req.body,
      timeout: 5000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[GROUP PROXY ERROR]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

module.exports = router;
