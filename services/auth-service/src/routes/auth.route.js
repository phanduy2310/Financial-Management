const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refreshToken);
router.post("/logout", auth.logout);
router.get("/users/find", auth.findByEmail);
router.post("/users/bulk", auth.getUsersBulk);
router.get("/users/:id", auth.getUserById);

router.get("/me", authenticate, auth.me);

router.get("/admin-only", authenticate, authorize("admin"), (req, res) => {
    res.json({ message: `Xin chào admin ${req.user.fullname}` });
});

module.exports = router;
