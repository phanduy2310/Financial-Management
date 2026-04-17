const router = require("express").Router();
const c = require("../controllers/group");
const {authen, authorize} = require("../middlewares/auth")

router.post("/", authen, c.createGroup);
router.patch("/:id", authen, c.updateGroup);
router.delete("/:id", authen, c.deleteGroup);
router.get("/my-groups", authen, c.getMyGroups);

module.exports = router;
 