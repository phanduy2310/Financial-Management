const express = require("express");
const router = express.Router();
const controller = require("../controllers/transaction");

router.post("/", controller.create);

// Static routes TRƯỚC dynamic routes
router.get("/detail/:id", controller.getTransactionDetail);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);


// Dynamic catch-all CUỐI CÙNG
router.get("/:user_id", controller.getAllByUser);


module.exports = router;
