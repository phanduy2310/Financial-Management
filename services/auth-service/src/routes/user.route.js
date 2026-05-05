const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authenticate, requireInternalKey } = require("../middleware/auth.middleware");

// Client gọi để tìm user theo email (ví dụ: add member vào nhóm)
router.get("/find", authenticate, userController.findByEmail);

// /me phải đặt trước /:id để không bị match nhầm
router.get("/me", authenticate, userController.me);

// Các route bên dưới chỉ dành cho internal service calls
router.use(requireInternalKey);
router.post("/infor", userController.getUsersInforBulk);
router.get("/:id", userController.getUserById);

module.exports = router;
