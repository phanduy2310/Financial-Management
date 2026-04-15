const express = require("express");
const router = express.Router();

const controller = require("../controllers/parent_child.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Parent
router.post(
    "/children",
    authMiddleware.authenticate,
    authMiddleware.authorize("parent"),
    controller.addChildByEmail
);

// Child confirm
router.post("/confirm", authMiddleware.authenticate, controller.confirmLink);

// Parent list children
router.get(
    "/children",
    authMiddleware.authenticate,
    authMiddleware.authorize("parent"),
    controller.getChildren
);

module.exports = router;
