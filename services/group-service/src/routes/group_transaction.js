const router = require("express").Router();
const c = require("../controllers/group_transaction");

router.post("/", c.createTransaction);
router.get("/detail/:transaction_id", c.getTransactionDetail);
router.get("/:group_id/summary", c.getSummary);
router.get("/:group_id", c.getTransactions);

module.exports = router;
