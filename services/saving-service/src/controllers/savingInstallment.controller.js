const SavingInstallment = require("../models/savingInstallment.model");
const {
    addSavingInstallment,
    deleteSavingInstallment,
} = require("../application/saving/savingPlan.application");
const {
    validateSavingInstallmentCreateInput,
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

exports.addInstallment = async (req, res) => {
    try {
        const input = validateSavingInstallmentCreateInput({
            params: req.params,
            body: req.body,
        });
        const result = await addSavingInstallment(input);

        res.status(201).json({
            message: "Đã thêm khoản trả góp",
            installment: result.installment,
            new_progress: result.new_progress,
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
        const result = await deleteSavingInstallment({ id });

        res.json({
            message: "Đã xóa khoản trả góp",
            new_progress: result.new_progress,
        });
    } catch (err) {
        return sendError(res, err);
    }
};
