const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const {
    authenticate,
    authorize,
    requireInternalKey,
} = require("../middleware/auth.middleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refreshToken);
router.post("/logout", auth.logout);

module.exports = router;
