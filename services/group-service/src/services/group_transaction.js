const GroupTransaction = require("../models/group_transaction");
const { transaction } = require("../config/objection");
const GroupTransactionShare = require("../models/group_transaction_share");

class GroupTransactionService {

    async createGroupTransactionWithShares({
        group_id,
        user_id,
        type,
        category,
        amount,
        note,
        date,
        shares
    }) {
        return transaction(GroupTransaction.knex(), async (trx) => {
            const groupTransaction = await GroupTransaction.query(trx).insert({
                group_id,
                user_id,
                type,
                category,
                amount,
                note,
                date
            });

            if (shares.length > 0) {
                for (const share of shares) {
                    await GroupTransactionShare.query(trx).insert({
                        transaction_id: groupTransaction.id,
                        user_id: share.user_id,
                        amount: Number(share.amount)
                    });
                }
            }

            return {
                transaction_id: groupTransaction.id
            };
        });
    };

    async getAllTransactions(group_id) {
        return GroupTransaction.query()
            .where("group_id", group_id)
            .orderBy("date", "desc");
    }

    async getById(id) {
        return GroupTransaction.query().findById(id);
    }

    async delete(id) {
        return GroupTransaction.query().deleteById(id);
    }

    async summary(group_id) {
        const rows = await GroupTransaction.query()
            .where("group_id", group_id)
            .select("type")
            .sum("amount as total")
            .groupBy("type");

        let total_income = 0;
        let total_expense = 0;

        for (const row of rows) {
            if (row.type === "income") {
                total_income = Number(row.total) || 0;
            }

            if (row.type === "expense") {
                total_expense = Number(row.total) || 0;
            }
        }

        return {
            total_income,
            total_expense
        };
    }
}

module.exports = new GroupTransactionService();
