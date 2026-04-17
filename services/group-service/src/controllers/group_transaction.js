const trans = require("../services/group_transaction");
const shareService = require("../services/group_transaction_share");
const { success, error } = require("../utils/response");

exports.createTransaction = async (req, res) => {
    try {
        const { group_id, user_id, type, category, amount, note, shares } =
            req.body;

        if (!group_id || !user_id || !type || !category || !amount) {
            return error(res, "Thiếu thông tin bắt buộc", 400);
        } 

        // 1. Lưu giao dịch nhóm
        const trx = await trans.create({
            group_id,
            user_id,
            type,
            category,
            amount,
            note,
        });

        // 2. Lưu chia tiền (khi có shares)
        if (shares && shares.length > 0) {
            const today = new Date().toISOString().slice(0, 10);
            const createdTxIds = []; // track IDs để bù trừ nếu lỗi giữa chừng

            for (const share of shares) {
                const transactionPayload = {
                    user_id: share.user_id,
                    category: category || (type === "income" ? "Thu quỹ nhóm" : "Chi tiêu nhóm"),
                    type: type === "income" ? "expense" : "expense",
                    amount: Number(share.amount),
                    date: today,
                    note: `${type === "income" ? "Thu quỹ" : "Chi tiêu"} nhóm #${group_id}: ${note || ""}`,
                };

            }

            // Tất cả personal transactions thành công → mới lưu shares
            await shareService.addShares(trx.id, shares);
        }

        success(res, { trx_id: trx.id }, "Thêm giao dịch nhóm thành công");
    } catch (err) {
        console.error("[GROUP TRANS ERROR]", err);
        error(res, err.message);
    }
};

exports.getTransactionDetail = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const transaction = await trans.getById(transaction_id);
        if (!transaction) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy giao dịch" });
        }
        const shares = await shareService.getByTransaction(transaction_id);
        const userIds = new Set([
            transaction.user_id,
            ...shares.map((s) => s.user_id),
        ]);

        const userMap = Object.fromEntries(userIds.map((u) => [u.id, u]));
        transaction.user = userMap[transaction.user_id] || null;
        const sharesWithUser = shares.map((s) => ({
            ...s,
            user: userMap[s.user_id] || null,
        }));

        return res.json({
            success: true,
            data: {
                transaction,
                shares: sharesWithUser,
            },
        });
    } catch (err) {
        console.error("[DETAIL ERROR]", err);
        return res.status(500).json({ message: err.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const list = await trans.getByGroup(req.params.group_id);
        success(res, list);
    } catch (err) {
        error(res, err.message);
    }
};

exports.getSummary = async (req, res) => {
    try {
        const data = await trans.summary(req.params.group_id);
        success(res, data);
    } catch (err) {
        error(res, err.message);
    }
};
