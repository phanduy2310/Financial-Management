const GroupTransaction = require("../models/group_transaction");

class GroupTransactionService {
    async create(data) {
        return GroupTransaction.query().insert(data);
    }

    async getByGroup(group_id) {
        return GroupTransaction.query()
            .where("group_id", group_id)
            .orderBy("created_at", "desc");
    }

    async getById(id) {
        return GroupTransaction.query().findById(id);
    }

    async delete(id) {
        return GroupTransaction.query().deleteById(id);
    }

    async summary(group_id) {
        const stats = await GroupTransaction.query()
            .where("group_id", group_id)
            .select("type")
            .sum("amount as total")
            .groupBy("type");

        let income = 0,
            expense = 0;

        stats.forEach((s) => {
            if (s.type === "income") income = Number(s.total);
            else if (s.type === "expense") expense = Number(s.total);
        });

        return {
            income,
            expense,
            balance: income - expense,
        };
    }
}

module.exports = new GroupTransactionService();
