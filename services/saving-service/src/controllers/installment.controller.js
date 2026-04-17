const InstallmentPlan = require("../models/installment.model");
const InstallmentPayment = require("../models/installment_payment.model");
const {
    createInstallmentPlan,
    deleteInstallmentPlan,
    payInstallment,
    updateInstallmentPlan,
} = require("../application/installment/installmentPlan.application");
const { createDomainError } = require("../domain/common/domainError");
const {
    validateInstallmentCreateInput,
    validateInstallmentUpdateInput,
} = require("../utils/requestValidators");

function sendError(res, err) {
    if (err.status) {
        const body = { message: err.message };
        if (err.details) {
            body.error = err.details;
        }
        return res.status(err.status).json(body);
    }

    return res.status(500).json({ error: err.message });
}

exports.create = async (req, res) => {
    try {
        const input = validateInstallmentCreateInput(req.body);
        const plan = await createInstallmentPlan(input);

        res.status(201).json({ message: "Tạo khoản trả góp thành công", plan });
    } catch (err) {
        return sendError(res, err);
    }
};

exports.payInstallment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await payInstallment({ id });

        res.json({
            message: result.message,
            plan: result.plan,
        });
    } catch (err) {
        return sendError(res, err);
    }
};

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

exports.getStats = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await InstallmentPlan.query().where("user_id", user_id);
        if (!plans.length) {
            return res.json({
                total_plans: 0,
                completed: 0,
                total_debt: 0,
                total_paid: 0,
                avg_progress: 0,
            });
        }

        const total_plans = plans.length;
        const completed = plans.filter((p) => p.completed).length;
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

exports.updateInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const currentPlan = await InstallmentPlan.query().findById(id);

        if (!currentPlan) {
            throw createDomainError(404, "Không tìm thấy khoản trả góp");
        }

        const fields = validateInstallmentUpdateInput(req.body, currentPlan);
        const updated = await updateInstallmentPlan({ id, fields });

        res.json({ message: "Cập nhật thông tin thành công", plan: updated });
    } catch (err) {
        return sendError(res, err);
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteInstallmentPlan({ id });

        res.json({ message: "Đã xóa khoản trả góp và lịch sử liên quan" });
    } catch (err) {
        return sendError(res, err);
    }
};

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

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await InstallmentPlan.query().findById(id);

        if (!plan) {
            return res.status(404).json({ message: "Không tìm thấy khoản trả góp" });
        }

        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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
