const trans = require("../services/group_transaction");
const group_share = require("../services/group_transaction_share");
const group_member = require("../services/group_member")
const { success, error } = require("../utils/response");
const user = require("../clients/user")

exports.createTransaction = async (req, res) => {
    try {
        const group_id = Number(req.params.group_id);
        const user_id = req.user.id;
        const { type, category, amount, note, date, shares } = req.body;

        if (!Number.isInteger(group_id) || group_id <= 0) {
            return error(res, "group_id không hợp lệ", 400, "INVALID_GROUP_ID");
        }

        if (!group_id || !type || !category || !amount || !date) {
            return error(
                res,
                "Thiếu thông tin bắt buộc",
                400,
                "MISSING_REQUIRED_FIELD"
            );
        }

        if (!["income", "expense"].includes(type)) {
            return error(res, "Loại giao dịch không hợp lệ", 400, "INVALID_TYPE");
        }

        if (Number(amount) <= 0) {
            return error(res, "Số tiền phải lớn hơn 0", 400, "INVALID_AMOUNT");
        }

        if (shares && !Array.isArray(shares)) {
            return error(res, "shares phải là một mảng", 400, "INVALID_SHARES");
        }

        const member = await group_member.getMember(group_id, user_id);

        if (!member) {
            return error(
                res,
                "Bạn không phải là thành viên của nhóm",
                403,
                "FORBIDDEN"
            );
        }

        const result = await trans.createGroupTransactionWithShares({
            group_id,
            user_id,
            type,
            category,
            amount: Number(amount),
            note,
            date,
            shares: shares || []
        });

        return success(res, result, "Thêm giao dịch nhóm thành công", 201);
    } catch (err) {
        console.error("[GROUP TRANS ERROR]", err);
        return error(
            res,
            "Không thể thêm giao dịch nhóm",
            500,
            "CREATE_GROUP_TRANSACTION_ERROR"
        );
    }
};

exports.getTransactionDetail = async (req, res) => {
    try {
        const group_id = req.params.group_id;
        const transaction_id = req.params.transaction_id;
        const requester_id = req.user.id;

        if (!group_id || !transaction_id) {
            return error(
                res,
                "Thiếu group_id hoặc transaction_id",
                400,
                "MISSING_REQUIRED_FIELD"
            );
        }

        const member = await group_member.getMember(group_id, requester_id);
        if (!member) {
            return error(
                res,
                "Bạn không phải là thành viên của nhóm",
                403,
                "FORBIDDEN"
            );
        }

        const transaction = await trans.getById(transaction_id);
        if (!transaction) {
            return error(res, "Không tìm thấy giao dịch", 404, "TRANSACTION_NOT_FOUND");
        }

        if (Number(transaction.group_id) !== Number(group_id)) {
            return error(
                res,
                "Giao dịch không thuộc nhóm này",
                403,
                "FORBIDDEN"
            );
        }

        const shares = await group_share.getByTransaction(transaction_id);

        const userIds = [
            ...new Set([
                transaction.user_id,
                ...shares.map((s) => s.user_id)
            ].filter(Boolean))
        ];

        const users = await user.getListFullNameByUserIds(userIds);

        const userMap = Object.fromEntries(
            users.map((user) => [user.id, user])
        );

        const transactionWithUser = {
            ...transaction,
            user: userMap[transaction.user_id] || null
        };

        const sharesWithUser = shares.map((s) => ({
            ...s,
            user: userMap[s.user_id] || null
        }));

        return success(
            res,
            {
                transaction: transactionWithUser,
                shares: sharesWithUser
            },
            "Lấy chi tiết giao dịch thành công"
        );
    } catch (err) {
        console.error("[DETAIL ERROR]", err);
        return error(
            res,
            "Không thể lấy chi tiết giao dịch",
            500,
            "GET_TRANSACTION_DETAIL_ERROR"
        );
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const group_id = req.params.group_id;
        const user_id = req.user.id;

        if (!group_id) {
            return error(res, "Thiếu group_id", 400, "MISSING_GROUP_ID");
        }

        const member = await group_member.getMember(group_id, user_id);
        if (!member) {
            return error(
                res,
                "Bạn không phải là thành viên của nhóm",
                403,
                "FORBIDDEN"
            );
        }


        const list = await trans.getAllTransactions(group_id);

        return success(res, list, "Lấy danh sách giao dịch nhóm thành công");
    } catch (err) {
        console.error("[GET GROUP TRANSACTIONS ERROR]", err);
        return error(
            res,
            "Không thể lấy danh sách giao dịch nhóm",
            500,
            "GET_GROUP_TRANSACTIONS_ERROR"
        );
    }
};


exports.getSummary = async (req, res) => {
    try {
        const group_id = req.params.group_id;
        const user_id = req.user.id;

        if (!group_id) {
            return error(res, "Thiếu group_id", 400, "MISSING_GROUP_ID");
        }

        const member = await group_member.getMember(group_id, user_id);
        if (!member) {
            return error(
                res,
                "Bạn không phải là thành viên của nhóm",
                403,
                "FORBIDDEN"
            );
        }

        const data = await trans.summary(group_id);

        const totalIncome = Number(data?.total_income) || 0;
        const totalExpense = Number(data?.total_expense) || 0;

        const result = {
            group_id: Number(group_id),
            total_income: totalIncome,
            total_expense: totalExpense,
            closing_balance: totalIncome - totalExpense
        };

        return success(res, result, "Lấy thống kê nhóm thành công");
    } catch (err) {
        console.error("[GET GROUP SUMMARY ERROR]", err);
        return error(
            res,
            "Không thể lấy thống kê nhóm",
            500,
            "GET_GROUP_SUMMARY_ERROR"
        );
    }
};
