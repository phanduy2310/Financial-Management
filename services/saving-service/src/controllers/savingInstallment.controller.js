const SavingInstallment = require("../models/savingInstallment.model");
const SavingPlan = require("../models/saving.model");
const {
    applySavingPlanState,
    buildHttpError,
    loadSavingPlanForUpdate,
    publishSavingPlanCompleted,
} = require("../services/savingPlanState.service");
const {
    validateSavingInstallmentCreateInput,
} = require("../utils/requestValidators");

function sendError(res, err) {
    if (err.status) {
        return res.status(err.status).json({ message: err.message });
    }

    return res.status(500).json({ error: err.message });
}

exports.addInstallment = async (req, res) => {
    try {
        const { saving_plan_id: savingPlanId, amount, note, payment_date } =
            validateSavingInstallmentCreateInput({
                params: req.params,
                body: req.body,
            });

        let installment;
        let progress;
        let notifyPayload = null;

        await SavingPlan.transaction(async (trx) => {
            const plan = await loadSavingPlanForUpdate(trx, savingPlanId);

            installment = await SavingInstallment.query(trx).insert({
                saving_plan_id: savingPlanId,
                amount,
                note,
                payment_date: payment_date || new Date().toISOString(),
            });

            const newAmount = Number(plan.current_amount) + Number(amount);
            progress =
                plan.target_amount > 0
                    ? Math.min((newAmount / plan.target_amount) * 100, 100)
                    : 0;

            const result = await applySavingPlanState({
                trx,
                plan,
                nextCurrentAmount: newAmount,
                completionErrorMessage:
                    "Thêm khoản tiết kiệm nhưng tạo transaction thất bại",
            });

            notifyPayload = result.notificationPayload;
        });

        publishSavingPlanCompleted(notifyPayload);

        res.status(201).json({
            message: "Đã thêm khoản trả góp",
            installment,
            new_progress: Number(progress.toFixed(2)),
        });
    } catch (err) {
        return sendError(res, err);
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

        let progress = 0;

        await SavingPlan.transaction(async (trx) => {
            const installment = await SavingInstallment.query(trx)
                .findById(id)
                .forUpdate();

            if (!installment) {
                throw buildHttpError(404, "Không tìm thấy khoản trả góp");
            }

            const plan = await SavingPlan.query(trx)
                .findById(installment.saving_plan_id)
                .forUpdate();

            if (!plan) {
                await SavingInstallment.query(trx).deleteById(id);
                return;
            }

            const newAmount = Math.max(
                Number(plan.current_amount) - Number(installment.amount),
                0
            );
            progress =
                plan.target_amount > 0
                    ? Math.min((newAmount / plan.target_amount) * 100, 100)
                    : 0;

            await applySavingPlanState({
                trx,
                plan,
                nextCurrentAmount: newAmount,
                completionErrorMessage:
                    "Cập nhật kế hoạch tiết kiệm thất bại",
            });

            await SavingInstallment.query(trx).deleteById(id);
        });

        res.json({
            message: "Đã xóa khoản trả góp",
            new_progress: Number(progress.toFixed(2)),
        });
    } catch (err) {
        return sendError(res, err);
    }
};
