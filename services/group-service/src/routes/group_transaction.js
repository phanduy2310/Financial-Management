const router = require("express").Router({ mergeParams: true });
const c = require("../controllers/group_transaction");
const {authen} = require("../middlewares/auth")

router.post("/", authen, c.createTransaction);
router.get("/", authen, c.getAllTransactions);
router.get("/summary", authen, c.getSummary);
router.get("/:transaction_id", authen, c.getTransactionDetail);


module.exports = router;
