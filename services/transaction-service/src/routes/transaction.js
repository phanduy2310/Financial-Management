const express = require("express");
const router = express.Router();
const controller = require("../controllers/transaction");
const { auth, authOrInternal } = require("../middlewares/auth")

router.post("/", authOrInternal, controller.create);

router.get("/detail/:id", auth, controller.getTransactionDetail); 
router.put("/:id", auth,  controller.updateTransaction);
router.delete("/:id", auth, controller.deleteTransaction);
// lấy tất cả tracsaction của tháng
router.get("/", auth, controller.getAllByMonth);

// mỗi tháng cần tính tổng nhập, tổng chi của tháng đó, số dư đầu tháng; tương tự cho thống kê theo năm
//stats/summary?period=month&month=4&year=2026
router.get("/stats/summary", auth, controller.getStatsSummary);
// thống kê thu chi months tháng gần nhất
router.get("/stats/monthly-summary", auth, controller.getMonthlySummary)

//thống kê theo category mỗi tháng: nhưng chưa có quản lí category nên chưa xử lí được
router.get("/stats/category", auth, controller.getStatsByCategory);



module.exports = router;
