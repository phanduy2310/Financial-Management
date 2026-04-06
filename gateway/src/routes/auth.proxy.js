const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const AUTH_URL = process.env.AUTH_SERVICE_URL;

router.use(async (req, res) => {
  try {
    const targetUrl = `${AUTH_URL}${req.originalUrl}`;
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization,
        Cookie: req.headers.cookie,
        host: undefined,
        connection: undefined,
      },
      data: req.body,
      validateStatus: () => true,
      timeout: 5000,
    });

    if (response.headers["set-cookie"]) {
      res.setHeader("set-cookie", response.headers["set-cookie"]);
    }

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[AUTH PROXY ERROR]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

module.exports = router;
