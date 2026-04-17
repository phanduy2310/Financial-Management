const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");
const auth = require("../middleware/auth.middleware");

router.get("/stream", controller.stream);
router.get("/unread-count", auth, controller.unreadCount);
router.get("/", auth, controller.list);
router.post("/:id/read", auth, controller.markRead);

module.exports = router;
