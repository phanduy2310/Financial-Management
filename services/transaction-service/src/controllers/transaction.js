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

// ==============================
// STATS MONTH
// ==============================
exports.getStatsByMonth = async (req, res) => {
    try {
        const { userId, month, year } = req.params;
        if (!userId || !month || !year)
            return error(res, "Missing userId, month or year", 400);

        const result = await service.getStatsByMonth(userId, month, year);
        success(res, result);
    } catch (err) {
        console.error("[STATS MONTH ERROR]", err);
        error(res);
    }
};

// ==============================
// STATS CATEGORY
// ==============================
exports.getStatsByCategory = async (req, res) => {
    try {
        const { userId } = req.params;
        const month = req.query.month || new Date().getMonth() + 1;
        const year = req.query.year || new Date().getFullYear();

        const result = await service.getStatsByCategory(userId, month, year);
        success(res, result);
    } catch (err) {
        console.error("[STATS CATEGORY ERROR]", err);
        error(res);
    }
};

// ==============================
// SUMMARY
// ==============================
exports.getSummaryStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const rows = await service.getSummaryByUser(userId);
        let income = 0,
            expense = 0;

        rows.forEach(({ type, total }) => {
            if (type === "income") income = Number(total);
            if (type === "expense") expense = Number(total);
        });

        success(res, {
            income,
            expense,
            balance: income - expense,
        });
    } catch (err) {
        console.error("[SUMMARY ERROR]", err);
        error(res);
    }
};

// ==============================
// STATS YEAR
// ==============================
exports.getStatsByYear = async (req, res) => {
    try {
        const { userId, year } = req.params;
        const rawStats = await service.getStatsByYear(userId, year);

        const monthly = {};
        rawStats.forEach(({ month, type, total }) => {
            if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
            monthly[month][type] = Number(total);
        });

        success(res, monthly);
    } catch (err) {
        console.error("[STATS YEAR ERROR]", err);
        error(res);
    }
};

// ==============================
// RANGE STATS
// ==============================
exports.getStatsByRange = async (req, res) => {
    try {
        const { userId, fromDate, toDate } = req.params;

        if (!userId || !fromDate || !toDate)
            return error(res, "Missing userId, fromDate or toDate", 400);

        const stats = await service.getStatsByRange(userId, fromDate, toDate);

        let income = 0,
            expense = 0;
        stats.forEach(({ type, total }) => {
            if (type === "income") income = Number(total);
            if (type === "expense") expense = Number(total);
        });

        success(res, {
            from: fromDate,
            to: toDate,
            income,
            expense,
            balance: income - expense,
        });
    } catch (err) {
        console.error("[STATS RANGE ERROR]", err);
        error(res);
    }
};

