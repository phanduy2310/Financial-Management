const router = require("express").Router({ mergeParams: true });
const c = require("../controllers/group_member");
const {authen} = require("../middlewares/auth")

router.get("/", authen, c.getAllMembers);
router.post("/", authen, c.addMember);
router.delete("/:user_id", authen, c.removeMember);

module.exports = router;
