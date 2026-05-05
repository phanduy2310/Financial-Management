const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const {
    authenticate,
    authorize,
    requireInternalKey,
} = require("../middleware/auth.middleware");

router.get("/", authenticate, authorize("admin"), (req, res) => {
    res.json({ message: `Xin chào admin ${req.user.fullname}` });
});

module.exports = router;
