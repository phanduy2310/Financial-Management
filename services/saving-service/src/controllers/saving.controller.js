const SavingPlan = require("../models/saving.model");
const {
    createSavingPlan,
    deleteSavingPlan,
    markSavingPlanCompleted,
    updateSavingPlanInfo,
    updateSavingPlanProgress,
} = require("../application/saving/savingPlan.application");
const { createDomainError } = require("../domain/common/domainError");
const {
    validateSavingCreateInput,
    validateSavingProgressInput,
    validateSavingUpdateInput,
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
        const input = validateSavingCreateInput(req.body);
        const plan = await createSavingPlan(input);

        res.status(201).json({ message: "Tạo kế hoạch thành công", plan });
    } catch (err) {
        return sendError(res, err);
    }
};

exports.getAllPlans = async (req, res) => {
    try {
        const plans = await SavingPlan.query().orderBy("created_at", "desc");
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await SavingPlan.query()
            .where("user_id", user_id)
            .orderBy("created_at", "desc");
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_amount } = validateSavingProgressInput(req.body);
        const updated = await updateSavingPlanProgress({ id, current_amount });

        res.json({
            message: "Cập nhật tiến độ thành công",
            plan: updated,
        });
    } catch (err) {
        return sendError(res, err);
    }
};

exports.markCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await markSavingPlanCompleted({ id });

        return res.json({
            message: "Đã đánh dấu hoàn thành kế hoạch",
            plan: updated,
        });
    } catch (err) {
        return sendError(res, err);
    }
};

exports.updateInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const currentPlan = await SavingPlan.query().findById(id);

        if (!currentPlan) {
            throw createDomainError(404, "Không tìm thấy kế hoạch");
        }

        const fields = validateSavingUpdateInput(req.body, currentPlan);
        const updated = await updateSavingPlanInfo({ id, fields });

        res.json({
            message: "Cập nhật thông tin kế hoạch thành công",
            plan: updated,
        });
    } catch (err) {
        return sendError(res, err);
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteSavingPlan({ id });

        res.json({ message: "Đã xóa kế hoạch thành công" });
    } catch (err) {
        return sendError(res, err);
    }
};

exports.getStats = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await SavingPlan.query().where("user_id", user_id);

        if (!plans.length) {
            return res.json({
                total_plans: 0,
                completed: 0,
                total_saving: 0,
                avg_progress: 0,
            });
        }

        const totalPlans = plans.length;
        const completed = plans.filter((plan) => plan.completed).length;
        const totalSaving = plans.reduce(
            (sum, plan) => sum + Number(plan.current_amount || 0),
            0
        );
        const avgProgress =
            plans.reduce(
                (sum, plan) => sum + Number(plan.progress_percentage || 0),
                0
            ) / totalPlans;

        res.json({
            total_plans: totalPlans,
            completed,
            total_saving: totalSaving,
            avg_progress: Number(avgProgress.toFixed(2)),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTopPlans = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await SavingPlan.query()
            .where("user_id", user_id)
            .orderBy("progress_percentage", "desc")
            .limit(3);
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProgressHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const SavingInstallment = require("../models/savingInstallment.model");
        const plan = await SavingPlan.query().findById(id);

        if (!plan) {
            return res.status(404).json({ message: "Không tìm thấy kế hoạch" });
        }

        const installments = await SavingInstallment.query()
            .where("saving_plan_id", id)
            .orderBy("payment_date", "asc");

        let cumulative = 0;
        const history = installments.map((inst) => {
            cumulative += Number(inst.amount);
            const progress =
                plan.target_amount > 0
                    ? Math.min((cumulative / plan.target_amount) * 100, 100)
                    : 0;

            return {
                date: new Date(inst.payment_date).toISOString().slice(0, 10),
                progress: Number(progress.toFixed(2)),
            };
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
