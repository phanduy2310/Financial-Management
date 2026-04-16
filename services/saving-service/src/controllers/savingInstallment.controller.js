const SavingInstallment = require("../models/savingInstallment.model");
const SavingPlan = require("../models/saving.model");

exports.addInstallment = async (req, res) => {
    try {
        const savingPlanId =
            req.params.saving_plan_id || req.body.saving_plan_id;
        const { amount, note, payment_date } = req.body;

        if (!savingPlanId || !amount) {
            return res
                .status(400)
                .json({ message: "Thiếu thông tin cần thiết" });
        }

        const plan = await SavingPlan.query().findById(savingPlanId);
        if (!plan) {
            return res.status(404).json({ message: "Không tìm thấy kế hoạch" });
        }

        const installment = await SavingInstallment.query().insert({
            saving_plan_id: savingPlanId,
            amount,
            note,
            payment_date: payment_date || new Date().toISOString(),
        });

        const newAmount = Number(plan.current_amount) + Number(amount);
        const progress = plan.target_amount > 0
            ? Math.min((newAmount / plan.target_amount) * 100, 100)
            : 0;

        await plan.$query().patch({
            current_amount: newAmount,
            progress_percentage: Number(progress.toFixed(2)),
            completed: newAmount >= plan.target_amount,
        });

        res.status(201).json({
            message: "Đã thêm khoản trả góp",
            installment,
            new_progress: Number(progress.toFixed(2)),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getByPlan = async (req, res) => {
    try {
        const { saving_plan_id } = req.params;
        const list = await SavingInstallment.query()
            .where("saving_plan_id", saving_plan_id)
            .orderBy("payment_date", "desc");
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const installment = await SavingInstallment.query().findById(id);
        if (!installment) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy khoản trả góp" });
        }

        const plan = await SavingPlan.query().findById(
            installment.saving_plan_id
        );
        if (!plan) {
            // Plan already deleted; just remove the installment
            await SavingInstallment.query().deleteById(id);
            return res.json({ message: "Đã xóa khoản trả góp", new_progress: 0 });
        }
        const newAmount = Math.max(
            Number(plan.current_amount) - Number(installment.amount),
            0
        );
        const progress = plan.target_amount > 0
            ? Math.min((newAmount / plan.target_amount) * 100, 100)
            : 0;

        await plan.$query().patch({
            current_amount: newAmount,
            progress_percentage: Number(progress.toFixed(2)),
            completed: newAmount >= plan.target_amount,
        });

        await SavingInstallment.query().deleteById(id);

        res.json({
            message: "Đã xóa khoản trả góp",
            new_progress: Number(progress.toFixed(2)),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
