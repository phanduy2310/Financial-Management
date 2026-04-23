const express = require("express");
const axios = require("axios");
const { error } = require("../utils/response");

const router = express.Router();
const SAVING_URL = process.env.SAVING_SERVICE_URL;

router.use(async (req, res) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;

    const response = await axios({
      method: req.method,
      url: `${SAVING_URL}${req.originalUrl}`,
      data: req.body,
      headers,
      validateStatus: () => true,
      timeout: 5000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[SAVING PROXY ERROR]", err.message);
    error(res, err.message, 502, "PROXY_ERROR");
  }
});

module.exports = router;
