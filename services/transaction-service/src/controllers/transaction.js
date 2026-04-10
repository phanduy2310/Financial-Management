const service = require("../services/transaction");
const { success, error } = require("../utils/response");

// ==============================
// CREATE TRANSACTION
// ==============================
exports.create = async (req, res) => {
    try {
        const required = ["user_id", "type", "category", "amount", "date"];
        for (const field of required) {
            if (!req.body[field]) {
                return error(res, `Missing required field: ${field}`, 400);
            }
        }

        const { user_id, type, category, amount, date, note } = req.body;
        const result = await service.create({ user_id, type, category, amount, date, note });

        success(res, result, "Tạo giao dịch thành công");
    } catch (err) {
        console.error("[CREATE TRANSACTION ERROR]", err);
        error(res);
    }
};

// ==============================
// GET ALL BY USER
// ==============================
exports.getAllByUser = async (req, res) => {
    try {
        const result = await service.getByUser(req.params.user_id);
        success(res, result);
    } catch (err) {
        console.error("[GET TRANSACTION ERROR]", err);
        error(res);
    }
};

// ==============================
// GET DETAIL
// ==============================
exports.getTransactionDetail = async (req, res) => {
    try {
        const result = await service.getById(req.params.id);
        if (!result) return error(res, "Giao dịch không tìm thấy", 404);

        success(res, result);
    } catch (err) {
        console.error("[GET DETAIL ERROR]", err);
        error(res);
    }
};

// ==============================
// UPDATE
// ==============================
exports.updateTransaction = async (req, res) => {
    try {
        const { type, category, amount, date, note } = req.body;
        const updated = await service.update(req.params.id, { type, category, amount, date, note });
        if (!updated) return error(res, "Giao dịch không tìm thấy", 404);

        success(res, null, "Cập nhật giao dịch thành công");
    } catch (err) {
        console.error("[UPDATE ERROR]", err);
        error(res);
    }
};

// ==============================
// DELETE
// ==============================
exports.deleteTransaction = async (req, res) => {
    try {
        const deleted = await service.delete(req.params.id);
        if (!deleted) return error(res, "Giao dịch không tìm thấy", 404);

        success(res, null, "Xóa giao dịch thành công");
    } catch (err) {
        console.error("[DELETE ERROR]", err);
        error(res);
    }
};


