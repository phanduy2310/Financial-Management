const Transaction = require("../models/transaction");

class TransactionService {
    create(data) {
        return Transaction.query().insert(data);
    }

    getByUser(user_id) {
        return Transaction.query()
            .where("user_id", user_id)
            .orderBy("date", "desc");
    }

    getById(id) {
        return Transaction.query().findById(id);
    }

    update(id, data) {
        const filtered = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );
        return Transaction.query().findById(id).patch(filtered);
    }

    delete(id) {
        return Transaction.query().deleteById(id);
    }

     // ========= STATS =========

    getStatsByMonth(user_id, month, year) {
        return Transaction.query()
            .where("user_id", user_id)
            .andWhereRaw("EXTRACT(MONTH FROM date) = ?", [month])
            .andWhereRaw("EXTRACT(YEAR FROM date) = ?", [year])
            .select("type")
            .sum("amount as total")
            .groupBy("type");
    }

    getStatsByCategory(user_id, month, year) {
        return Transaction.query()
            .where("user_id", user_id)
            .andWhereRaw("EXTRACT(MONTH FROM date) = ?", [month])
            .andWhereRaw("EXTRACT(YEAR FROM date) = ?", [year])
            .select("type", "category")
            .sum("amount as total")
            .groupBy("type", "category");
    }

    getStatsByYear(user_id, year) {
        return Transaction.query()
            .where("user_id", user_id)
            .andWhereRaw("EXTRACT(YEAR FROM date) = ?", [year])
            .select(
                Transaction.knex().raw("EXTRACT(MONTH FROM date) as month"),
                "type"
            )
            .sum("amount as total")
            .groupBy("month", "type")
            .orderBy("month");
    }

    getSummaryByUser(user_id) {
        return Transaction.query()
            .where("user_id", user_id)
            .select("type")
            .sum("amount as total")
            .groupBy("type");
    }

    getStatsByRange(user_id, from, to) {
        return Transaction.query()
            .where("user_id", user_id)
            .whereBetween("date", [from, to])
            .select("type")
            .sum("amount as total")
            .groupBy("type");
    }
}

module.exports = new TransactionService();
