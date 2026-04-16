const SavingPlan = require("../models/saving.model");
const {
    applySavingPlanState,
    buildHttpError,
    loadSavingPlanForUpdate,
    publishSavingPlanCompleted,
} = require("../services/savingPlanState.service");

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
        const { user_id, title, target_amount, start_date, end_date } =
            req.body;

        if (!user_id || !title || !target_amount || !start_date || !end_date) {
            return res
                .status(400)
                .json({ message: "Thiếu thông tin cần thiết" });
        }

        const plan = await SavingPlan.query().insert({
            user_id,
            title,
            target_amount,
            current_amount: 0,
            start_date,
            end_date,
            completed: false,
        });

        res.status(201).json({ message: "Tạo kế hoạch thành công", plan });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        const { current_amount } = req.body;

        let updated;
        let notifyPayload = null;

        await SavingPlan.transaction(async (trx) => {
            const plan = await loadSavingPlanForUpdate(trx, id);
            const result = await applySavingPlanState({
                trx,
                plan,
                nextCurrentAmount: current_amount,
                completionErrorMessage:
                    "Cập nhật tiến độ nhưng tạo transaction thất bại",
            });

            updated = result.updated;
            notifyPayload = result.notificationPayload;
        });

        publishSavingPlanCompleted(notifyPayload);

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

        let updated;
        let notifyPayload = null;

        await SavingPlan.transaction(async (trx) => {
            const plan = await loadSavingPlanForUpdate(trx, id);

            if (plan.completed) {
                throw buildHttpError(400, "Kế hoạch đã hoàn thành trước đó");
            }

            const result = await applySavingPlanState({
                trx,
                plan,
                nextCurrentAmount: plan.target_amount,
                completionErrorMessage:
                    "Hoàn thành kế hoạch nhưng tạo transaction thất bại",
            });

            updated = result.updated;
            notifyPayload = result.notificationPayload;
        });

        publishSavingPlanCompleted(notifyPayload);

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
        const { title, target_amount, start_date, end_date } = req.body;
        const fields = {};
        if (title !== undefined) fields.title = title;
        if (target_amount !== undefined) fields.target_amount = target_amount;
        if (start_date !== undefined) fields.start_date = start_date;
        if (end_date !== undefined) fields.end_date = end_date;

        if (Object.keys(fields).length === 0) {
            return res.status(400).json({ message: "Không có thông tin cần cập nhật" });
        }

        const updated = await SavingPlan.query().findById(id).patchAndFetch(fields);
        if (!updated) return res.status(404).json({ message: "Không tìm thấy kế hoạch" });
        res.json({
            message: "Cập nhật thông tin kế hoạch thành công",
            plan: updated,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await SavingPlan.query().deleteById(id);
        if (!deleted) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy kế hoạch để xóa" });
        }
        res.json({ message: "Đã xóa kế hoạch thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        if (!plan) return res.status(404).json({ message: "Không tìm thấy kế hoạch" });

        const installments = await SavingInstallment.query()
            .where("saving_plan_id", id)
            .orderBy("payment_date", "asc");

        let cumulative = 0;
        const history = installments.map((inst) => {
            cumulative += Number(inst.amount);
            const progress = plan.target_amount > 0
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
