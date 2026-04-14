const express = require("express");
const router = express.Router();
const controller = require("../controllers/transaction");

router.post("/", controller.create);

// Static routes TRƯỚC dynamic routes
router.get("/detail/:id", controller.getTransactionDetail);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);

router.get("/stats/category/:userId", controller.getStatsByCategory);
router.get("/stats/summary/:userId", controller.getSummaryStats);
router.get("/stats/year/:userId/:year", controller.getStatsByYear);
router.get("/stats/range/:userId/:fromDate/:toDate", controller.getStatsByRange);
router.get("/stats/:userId/:month/:year", controller.getStatsByMonth);

// Dynamic catch-all CUỐI CÙNG
router.get("/:user_id", controller.getAllByUser);


module.exports = router;
