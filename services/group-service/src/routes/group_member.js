const router = require("express").Router();
const c = require("../controllers/group_member");

router.get("/:group_id", c.getMembers);
router.post("/add", c.addMember);
router.post("/remove", c.removeMember);

module.exports = router;
