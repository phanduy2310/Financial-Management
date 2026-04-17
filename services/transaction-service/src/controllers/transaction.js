const service = require("../services/transaction");
const { success, error } = require("../utils/response");

// ==============================
// CREATE TRANSACTION
// ==============================
exports.create = async (req, res) => {
    try {
        const required = ["type", "category", "amount", "date"];
        for (const field of required) {
            if (!req.body[field]) {
                return error(res, `Missing required field: ${field}`, 400, "MISSING_REQUIRED_FIELD");
            }
        }

        const { type, category, amount, date, note } = req.body;
        const result = await service.create({ user_id: req.user.id, type, category, amount, date, note });

        success(res, result, "Tạo giao dịch thành công", 201);
    } catch (err) {
        console.error("CREATE TRANSACTION ERROR", err);
        error(res, "Không thể tạo giao dịch", 500, "CREATE_TRANSACTION_ERROR");
    }
};

// ==============================
// GET ALL BY Month
// ==============================
exports.getAllByMonth = async (req, res) => {
    try {
        const userId = req.user.id;
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        const year = Number(req.query.year) || new Date().getFullYear();

        if (month < 1 || month > 12) {
            return error(res, "Month must be between 1 and 12", 400, "INVALID_MONTH");
        }

        if (year < 2000 || year > 3000) {
            return error(res, "Invalid year", 400, "INVALID_YEAR");
        }

        const result = await service.getAllByMonth(userId, month, year);

        return success(res, result, "Lấy danh sách giao dịch theo tháng thành công");
    } catch (err) {
        console.error("[GET TRANSACTION ERROR]", err);
        return error(res, "Không thể lấy danh sách giao dịch", 500, "GET_TRANSACTION_ERROR");
    }
};

// ==============================
// GET DETAIL
// ==============================
exports.getTransactionDetail = async (req, res) => {
    try {
        const result = await service.getById(req.params.id);
        if (!result) return error(res, "Giao dịch không tìm thấy", 404, "NOT_FOUND");
        //phụ huynh có thể truy cập
        // if (result.user_id !== req.user.id) return error(res, "Không có quyền truy cập", 403, "FORBIDDEN");

        success(res, result);
    } catch (err) {
        console.error("[GET DETAIL ERROR]", err);
        error(res, "GET DETAIL ERROR", 500, "GET_DETAIL_ERROR");
    }
};

// ==============================
// UPDATE
// ==============================
exports.updateTransaction = async (req, res) => {
    try {
        const existing = await service.getById(req.params.id);
        if (!existing) return error(res, "Giao dịch không tìm thấy", 404, "NOT_FOUND");
        if (existing.user_id !== req.user.id) return error(res, "Không có quyền truy cập", 403, "FORBIDDEN");

        const { type, category, amount, date, note } = req.body;
        await service.update(req.params.id, { type, category, amount, date, note });

        success(res, null, "Cập nhật giao dịch thành công", 200);
    } catch (err) {
        console.error("[UPDATE ERROR]", err);
        error(res, "UPDATE ERROR", 500, "UPDATE_ERROR");
    }
};

// ==============================
// DELETE
// ==============================
exports.deleteTransaction = async (req, res) => {
    try {
        const existing = await service.getById(req.params.id);
        if (!existing) return error(res, "Giao dịch không tìm thấy", 404, "NOT_FOUND");
        if (existing.user_id !== req.user.id) return error(res, "Không có quyền truy cập", 403, "FORBIDDEN");

        await service.delete(req.params.id);
        success(res, null, "Xóa giao dịch thành công");
    } catch (err) {
        console.error("[DELETE ERROR]", err);
        error(res, "DELETE ERROR", 500, "DELETE_ERROR");
    }
};

// ==============================
// STATS CATEGORY
// ==============================
exports.getStatsByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const month = Number(req.query.month) || new Date().getMonth() + 1; //new Date().getMonth() trong JavaScript trả về tháng từ 0 đến 11, không phải từ 1 đến 12.
        const year = Number(req.query.year) || new Date().getFullYear();

        if (month < 1 || month > 12) {
            return error(res, "Month must be between 1 and 12", 400, "INVALID_MONTH");
        }

        if (year < 2000 || year > 3000) {
            return error(res, "Invalid year", 400, "INVALID_YEAR");
        }

        const result = await service.getStatsByCategory(userId, month, year);

        return success(res, result, "Lấy thống kê theo danh mục thành công");
    } catch (err) {
        console.error("[STATS CATEGORY ERROR]", err);
        return error(
            res,
            "Không thể lấy thống kê theo danh mục",
            500,
            "STATS_CATEGORY_ERROR"
        );
    }
};

// ==============================
// SUMMARY
// thống kê theo tháng hoặc theo năm
exports.getStatsSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || "month";
        const currentDate = new Date();

        const month = Number(req.query.month) || currentDate.getMonth() + 1;
        const year = Number(req.query.year) || currentDate.getFullYear();

        if (!["month", "year"].includes(period)) {
            return error(res, "Invalid period", 400, "INVALID_PERIOD");
        }

        if (period === "month" && (month < 1 || month > 12)) {
            return error(res, "Month must be between 1 and 12", 400, "INVALID_MONTH");
        }

        if (year < 2000 || year > 3000) {
            return error(res, "Invalid year", 400, "INVALID_YEAR");
        }

        let stats = [];
        let openingBalance = 0;
        let result = {};

        if (period === "month") {
            stats = await service.getStatsByMonth(userId, month, year);
            openingBalance = await service.getOpeningBalanceByMonth(userId, month, year);

            let totalIncome = 0;
            let totalExpense = 0;

            for (const item of stats) {
                if (item.type === "income") totalIncome = Number(item.total) || 0;
                if (item.type === "expense") totalExpense = Number(item.total) || 0;
            }

            result = {
                period,
                month,
                year,
                opening_balance: openingBalance,
                total_income: totalIncome,
                total_expense: totalExpense,
                closing_balance: openingBalance + totalIncome - totalExpense
            };
        }

        if (period === "year") {
            stats = await service.getStatsByYear(userId, year);
            openingBalance = await service.getOpeningBalanceByYear(userId, year);

            let totalIncome = 0;
            let totalExpense = 0;

            for (const item of stats) {
                if (item.type === "income") totalIncome = Number(item.total) || 0;
                if (item.type === "expense") totalExpense = Number(item.total) || 0;
            }

            result = {
                period,
                year,
                opening_balance: openingBalance,
                total_income: totalIncome,
                total_expense: totalExpense,
                closing_balance: openingBalance + totalIncome - totalExpense
            };
        }

        return success(res, result, "Lấy thống kê tổng quan thành công");
    } catch (err) {
        console.error("[STATS SUMMARY ERROR]", err);
        return error(res, "Không thể lấy thống kê tổng quan", 500, "STATS_SUMMARY_ERROR");
    }
};

exports.getMonthlySummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const months = Number(req.query.months) || 6;

        if (!Number.isInteger(months) || months < 1 || months > 24) {
            return error(
                res,
                "months must be an integer between 1 and 24",
                400,
                "INVALID_MONTHS"
            );
        }

        const result = await service.getMonthlySummary(userId, months);

        return success(
            res,
            {
                months,
                data: result
            },
            "Lấy dữ liệu thống kê các tháng gần nhất thành công"
        );
    } catch (err) {
        console.error("[GET MONTHLY SUMMARY ERROR]", err);
        return error(
            res,
            "Không thể lấy dữ liệu thống kê các tháng gần nhất",
            500,
            "GET_MONTHLY_SUMMARY_ERROR"
        );
    }
};



