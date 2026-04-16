const express = require("express");
const router = express.Router();
const controller = require("../controllers/installment.controller");

// 🆕 1. Tạo khoản trả góp mới
router.post("/", controller.create);

// 💰 2. Thanh toán 1 kỳ trả góp
router.patch("/:id/pay", controller.payInstallment);

// 🧾 4. Cập nhật thông tin khoản trả góp
router.patch("/:id/update", controller.updateInfo);

// ❌ 5. Xóa khoản trả góp
router.delete("/:id", controller.delete);

// 📊 6. Lấy thống kê tổng quan của 1 user (static before dynamic)
router.get("/stats/:user_id", controller.getStats);

// 🏆 7. Lấy top 3 khoản trả góp sắp hoàn thành
router.get("/top/:user_id", controller.getTopPlans);

// 📈 8. Lấy lịch sử thanh toán (phục vụ biểu đồ)
router.get("/history/:id", controller.getPaymentHistory);

// 📋 9. Lấy chi tiết khoản trả góp theo ID
router.get("/detail/:id", controller.getById);

// 📈 10. Lấy dữ liệu biểu đồ thanh toán hàng tháng của user
router.get("/payments/chart/:user_id", controller.getPaymentChart);

// 📄 3. Lấy tất cả khoản trả góp của 1 user (dynamic last to avoid catching static routes)
router.get("/:user_id", controller.getAllByUser);

// Payments
// router.get("/:id/payments", paymentController.getByPlan); // ✅ lịch sử thanh toán
// router.post("/:id/payments", paymentController.create);


module.exports = router;
