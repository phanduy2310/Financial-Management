const express = require("express");
const router = express.Router();
const controller = require("../controllers/internal.controller");

// Middleware bảo vệ internal routes bằng shared secret
const internalAuth = (req, res, next) => {
  const key = req.headers["x-internal-key"];
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

router.post("/publish", internalAuth, controller.publish);

module.exports = router;
