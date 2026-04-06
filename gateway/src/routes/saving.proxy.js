const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const SAVING_URL = process.env.SAVING_SERVICE_URL;

router.use(async (req, res) => {
  try {
    const targetUrl = `${SAVING_URL}${req.originalUrl}`;
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        "Content-Type": "application/json",
        host: undefined,
        connection: undefined,
      },
      data: req.body,
      timeout: 5000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[SAVING PROXY ERROR]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

module.exports = router;
