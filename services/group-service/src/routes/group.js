const router = require("express").Router();
const c = require("../controllers/group");

router.post("/", c.createGroup);
router.patch("/:id", c.updateGroup);
router.delete("/:id", c.deleteGroup);
router.get("/user/:user_id", c.getGroupsOfUser);

module.exports = router;
 