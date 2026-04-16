const InstallmentPlan = require("../models/installment.model");
const InstallmentPayment = require("../models/installment_payment.model");
const transactionClient = require("../clients/transaction.client");
const notifyClient = require("../clients/notification.client");

// 🆕 1. Tạo kế hoạch trả góp
exports.create = async (req, res) => {
    try {
        const {
            user_id,
            title,
            total_amount,
            monthly_payment,
            start_date,
            end_date,
            total_terms,
        } = req.body;
        if (
            !user_id ||
            !title ||
            !total_amount ||
            !monthly_payment ||
            !start_date ||
            !end_date ||
            !total_terms
        )
            return res
                .status(400)
                .json({ message: "Thiếu thông tin cần thiết" });

        const plan = await InstallmentPlan.query().insert({
            user_id: Number(user_id),
            title,
            total_amount: parseFloat(total_amount),
            monthly_payment: parseFloat(monthly_payment),
            start_date,
            end_date,
            total_terms: parseInt(total_terms),
            paid_amount: 0,
            current_term: 0,
            completed: false,
        });

        res.status(201).json({ message: "Tạo khoản trả góp thành công", plan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📄 2. Cập nhật khi thanh toán 1 kỳ
exports.payInstallment = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await InstallmentPlan.query().findById(id);

        if (!plan)
            return res
                .status(404)
                .json({ message: "Không tìm thấy khoản trả góp" });

        // 🔒 Kiểm tra trạng thái
        if (plan.completed || plan.current_term >= plan.total_terms) {
            return res.status(400).json({
                message:
                    "Khoản trả góp đã hoàn thành, không thể thanh toán thêm.",
            });
        }

        // 🧮 Tính toán dữ liệu mới
        let newPaidAmount =
            Number(plan.paid_amount) + Number(plan.monthly_payment);
        let newTerm = plan.current_term + 1;

        // Giới hạn không vượt tổng tiền
        if (newPaidAmount > plan.total_amount) {
            newPaidAmount = Number(plan.total_amount);
        }

        // Tiến độ %
        const progress_percentage = Math.min(
            (newPaidAmount / plan.total_amount) * 100,
            100
        );

        const isCompleted =
            newPaidAmount >= plan.total_amount || newTerm >= plan.total_terms;

        // 🕓 Thời gian & note mặc định
        const today = new Date().toISOString().slice(0, 19).replace("T", " ");
        const note = `Thanh toán kỳ ${newTerm} (${new Date().toLocaleDateString(
            "vi-VN"
        )})`;

        // 1️⃣ Gọi transaction service TRƯỚC khi lưu DB để tránh inconsistency
        const transactionPayload = {
            user_id: plan.user_id,
            category: "Thanh toán khoản trả góp",
            type: "expense",
            amount: Number(plan.monthly_payment),
            date: new Date().toISOString().slice(0, 10),
            note: `Thanh toán kỳ ${newTerm} cho khoản trả góp: ${plan.title}`,
        };
        try {
            console.log(
                "[TRANSACTION SERVICE] Gửi payload:",
                transactionPayload
            );
            await transactionClient.post("/api/transactions", transactionPayload);
        } catch (err) {
            console.error("[TRANSACTION SERVICE ERROR]", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            return res.status(500).json({
                message: "Thanh toán kỳ nhưng tạo transaction thất bại",
                error: err.message,
            });
        }

        // 2️⃣ Transaction service thành công → lưu DB
        const updated = await plan.$query().patchAndFetch({
            paid_amount: newPaidAmount,
            current_term: newTerm,
            progress_percentage: Number(progress_percentage.toFixed(2)),
            completed: isCompleted,
        });

        // 🪶 Ghi lịch sử thanh toán
        await InstallmentPayment.query().insert({
            plan_id: Number(id),
            term_number: newTerm,
            amount: Number(plan.monthly_payment),
            note,
            pay_date: today,
        });

        // Gửi notification (fire-and-forget)
        const remainingTerms = plan.total_terms - newTerm;
        if (isCompleted) {
            // Hoàn thành toàn bộ
            notifyClient.publish("INSTALLMENT_DUE_SOON", plan.user_id, {
                title: plan.title,
                due_date: plan.end_date,
                message: `Khoản trả góp "${plan.title}" đã hoàn thành!`,
            });
        } else if (remainingTerms <= 2) {
            // Còn ít kỳ, nhắc nhở
            notifyClient.publish("INSTALLMENT_DUE_SOON", plan.user_id, {
                title: plan.title,
                due_date: plan.end_date,
                message: `Còn ${remainingTerms} kỳ nữa là hoàn thành khoản trả góp "${plan.title}"`,
            });
        }

        res.json({
            message: isCompleted
                ? "Khoản trả góp đã hoàn thành"
                : "Đã thanh toán kỳ mới thành công",
            plan: updated,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📄 3. Lấy tất cả kế hoạch trả góp của 1 user
exports.getAllByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await InstallmentPlan.query()
            .where("user_id", user_id)
            .orderBy("created_at", "desc");
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📊 4. Thống kê tổng quan kế hoạch trả góp của 1 user
exports.getStats = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await InstallmentPlan.query().where("user_id", user_id);
        if (!plans.length)
            return res.json({
                total_plans: 0,
                completed: 0,
                total_debt: 0,
                total_paid: 0,
                avg_progress: 0,
            });

        const total_plans = plans.length;
        const completed = plans.filter((p) => p.completed).length;

        // ✅ Ép kiểu rõ ràng
        const total_debt = plans.reduce(
            (sum, p) => sum + (Number(p.total_amount) - Number(p.paid_amount)),
            0
        );

        const total_paid = plans.reduce(
            (sum, p) => sum + Number(p.paid_amount || 0),
            0
        );

        const avg_progress =
            plans.reduce(
                (sum, p) => sum + Number(p.progress_percentage || 0),
                0
            ) / total_plans;

        res.json({
            total_plans,
            completed,
            total_debt: Number(total_debt.toFixed(2)),
            total_paid: Number(total_paid.toFixed(2)),
            avg_progress: Number(avg_progress.toFixed(2)),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📝 5. Cập nhật thông tin kế hoạch trả góp
exports.updateInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await InstallmentPlan.query().findById(id);
        if (!plan)
            return res
                .status(404)
                .json({ message: "Không tìm thấy khoản trả góp" });

        const { title, total_amount, monthly_payment, start_date, end_date, total_terms } = req.body;
        const fields = {};
        if (title !== undefined) fields.title = title;
        if (total_amount !== undefined) fields.total_amount = parseFloat(total_amount);
        if (monthly_payment !== undefined) fields.monthly_payment = parseFloat(monthly_payment);
        if (start_date !== undefined) fields.start_date = start_date;
        if (end_date !== undefined) fields.end_date = end_date;
        if (total_terms !== undefined) fields.total_terms = parseInt(total_terms);

        if (Object.keys(fields).length === 0) {
            return res.status(400).json({ message: "Không có thông tin cần cập nhật" });
        }

        const updated = await plan.$query().patchAndFetch(fields);
        res.json({ message: "Cập nhật thông tin thành công", plan: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ❌ 6. Xóa kế hoạch trả góp
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await InstallmentPlan.query().findById(id);
        if (!plan) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy khoản trả góp để xóa" });
        }

        // 1️⃣ Xóa lịch sử thanh toán trước
        await InstallmentPayment.query().where("plan_id", id).delete();

        // 2️⃣ Xóa kế hoạch trả góp
        await InstallmentPlan.query().deleteById(id);

        res.json({ message: "Đã xóa khoản trả góp và lịch sử liên quan" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📈 7. Lấy top 3 kế hoạch trả góp theo tiến độ
exports.getTopPlans = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await InstallmentPlan.query()
            .where("user_id", user_id)
            .orderBy("progress_percentage", "desc")
            .limit(3);
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📈 8. Lịch sử thanh toán thật cho 1 kế hoạch
exports.getPaymentHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const payments = await InstallmentPayment.query()
            .where("plan_id", id)
            .orderBy("pay_date", "asc");

        const formatted = payments.map((p) => ({
            date: new Date(p.pay_date).toLocaleDateString("vi-VN"),
            amount: Number(p.amount),
            term: p.term_number,
            note: p.note || "",
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📘 Lấy chi tiết 1 khoản trả góp theo ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await InstallmentPlan.query().findById(id);

        if (!plan) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy khoản trả góp" });
        }

        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📊 9. Biểu đồ thanh toán theo ngày của 1 user
exports.getPaymentChart = async (req, res) => {
    try {
        const { user_id } = req.params;
        const payments = await InstallmentPayment.query()
            .join(
                "installment_plans",
                "installment_plans.id",
                "=",
                "installment_payments.plan_id"
            )
            .where("installment_plans.user_id", user_id)
            .orderBy("pay_date", "asc");

        const grouped = payments.reduce((acc, p) => {
            const date = new Date(p.pay_date).toLocaleDateString("vi-VN");
            acc[date] = (acc[date] || 0) + Number(p.amount);
            return acc;
        }, {});

        const result = Object.entries(grouped).map(([date, amount]) => ({
            date,
            amount,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
