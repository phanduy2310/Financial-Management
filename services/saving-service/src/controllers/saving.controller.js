const SavingPlan = require("../models/saving.model");
const transactionClient = require("../clients/transaction.client");
const notifyClient = require("../clients/notification.client");

function buildHttpError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    err.details = details;
    return err;
}

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
            const plan = await SavingPlan.query(trx).findById(id).forUpdate();
            if (!plan) {
                throw buildHttpError(404, "Không tìm thấy kế hoạch");
            }

            const progressPercentage =
                plan.target_amount > 0
                    ? Math.min((current_amount / plan.target_amount) * 100, 100)
                    : 0;
            const isNowCompleted = current_amount >= plan.target_amount;

            if (!plan.completed && isNowCompleted) {
                const transactionPayload = {
                    user_id: plan.user_id,
                    category: "Thực hiện kế hoạch tiết kiệm",
                    type: "expense",
                    amount: Number(plan.target_amount),
                    date: new Date().toISOString().slice(0, 10),
                    note: `Hoàn thành kế hoạch tiết kiệm: ${plan.title}`,
                };

                try {
                    await transactionClient.post(
                        "/api/transactions",
                        transactionPayload
                    );
                } catch (err) {
                    console.error("[TRANSACTION SERVICE ERROR]", {
                        message: err.message,
                        status: err.response?.status,
                        data: err.response?.data,
                    });
                    throw buildHttpError(
                        500,
                        "Cập nhật tiến độ nhưng tạo transaction thất bại",
                        err.message
                    );
                }
            }

            updated = await SavingPlan.query(trx).patchAndFetchById(id, {
                current_amount,
                progress_percentage: Number(progressPercentage.toFixed(2)),
                completed: isNowCompleted,
            });

            if (isNowCompleted) {
                notifyPayload = {
                    userId: plan.user_id,
                    title: plan.title,
                };
            }
        });

        if (notifyPayload) {
            notifyClient.publish("SAVING_PLAN_COMPLETED", notifyPayload.userId, {
                title: notifyPayload.title,
            });
        }

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
            const plan = await SavingPlan.query(trx).findById(id).forUpdate();

            if (!plan) {
                throw buildHttpError(404, "Không tìm thấy kế hoạch");
            }

            if (plan.completed) {
                throw buildHttpError(400, "Kế hoạch đã hoàn thành trước đó");
            }

            const transactionPayload = {
                user_id: plan.user_id,
                category: "Thực hiện kế hoạch tiết kiệm",
                type: "expense",
                amount: Number(plan.target_amount),
                date: new Date().toISOString().slice(0, 10),
                note: `Hoàn thành kế hoạch tiết kiệm: ${plan.title}`,
            };

            try {
                await transactionClient.post(
                    "/api/transactions",
                    transactionPayload
                );
            } catch (err) {
                console.error("[TRANSACTION SERVICE ERROR]", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                });
                throw buildHttpError(
                    500,
                    "Hoàn thành kế hoạch nhưng tạo transaction thất bại",
                    err.message
                );
            }

            updated = await SavingPlan.query(trx).patchAndFetchById(id, {
                completed: true,
                current_amount: Number(plan.target_amount),
                progress_percentage: 100,
            });

            notifyPayload = {
                userId: plan.user_id,
                title: plan.title,
            };
        });

        notifyClient.publish("SAVING_PLAN_COMPLETED", notifyPayload.userId, {
            title: notifyPayload.title,
        });

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
