const InstallmentPayment = require("../models/installment_payment.model");

// 📘 Lấy danh sách các kỳ thanh toán của 1 kế hoạch
exports.getByPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const payments = await InstallmentPayment.query()
            .where("plan_id", id)
            .orderBy("term_number", "asc");
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🧾 Tạo kỳ thanh toán mới (nếu dùng riêng)
exports.create = async (req, res) => {
    try {
        const { plan_id, term_number, amount } = req.body;
        if (!plan_id || !term_number || !amount)
            return res.status(400).json({ message: "Thiếu dữ liệu" });

        const payment = await InstallmentPayment.query().insert({
            plan_id,
            term_number,
            amount,
            pay_date: new Date(),
        });

        res.status(201).json({ message: "Đã ghi nhận thanh toán", payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
