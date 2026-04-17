const Share = require("../models/group_transaction_share");

class GroupTransactionShareService {
    async addShares(transaction_id, shares) {
        const rows = shares.map((s) => ({
            transaction_id,
            user_id: s.user_id,
            amount: s.amount,
        }));

        return Share.query().insert(rows);
    }

    async getByTransaction(transaction_id) {
        return Share.query().where("transaction_id", transaction_id);
    }

    async deleteByTransactionId(transaction_id) {
        return Share.query().delete().where("transaction_id", transaction_id);
    }
}

module.exports = new GroupTransactionShareService();
