const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const TRANSACTION_URL = process.env.TRANSACTION_SERVICE_URL;

router.use(async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${TRANSACTION_URL}${req.originalUrl}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization,
        host: undefined,
        connection: undefined,
      },
      timeout: 5000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("[TRANSACTION PROXY ERROR]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

module.exports = router;