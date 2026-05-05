const express = require("express");
const axios = require("axios");
const { error } = require("../utils/response");

const router = express.Router();
const AUTH_URL = process.env.AUTH_SERVICE_URL;

router.use(async (req, res) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;
    if (req.headers.cookie) headers["Cookie"] = req.headers.cookie;

    const response = await axios({
      method: req.method,
      url: `${AUTH_URL}${req.originalUrl}`,
      headers,
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
    error(res, err.message, 502, "PROXY_ERROR");
  }
});

module.exports = router;
