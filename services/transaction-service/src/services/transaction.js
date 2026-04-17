const Transaction = require("../models/transaction");

class TransactionService {
    create(data) {
        return Transaction.query().insert(data);
    }

    getAllByMonth(user_id, month, year) {
        return Transaction.query()
            .where("user_id", user_id)
            .andWhereRaw("EXTRACT(MONTH FROM date) = ?", [month])
            .andWhereRaw("EXTRACT(YEAR FROM date) = ?", [year])
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

    getStatsByYear(user_id, year) {
        return Transaction.query()
            .where("user_id", user_id)
            .andWhereRaw("EXTRACT(YEAR FROM date) = ?", [year])
            .select("type")
            .sum("amount as total")
            .groupBy("type");
    }

    getOpeningBalanceByMonth(user_id, month, year) {
        const firstDayOfMonth = new Date(year, month - 1, 1);

        return Transaction.query()
            .where("user_id", user_id)
            .where("date", "<", firstDayOfMonth)
            .select("type")
            .sum("amount as total")
            .groupBy("type")
            .then((rows) => {
                let totalIncomeBefore = 0;
                let totalExpenseBefore = 0;

                for (const item of rows) {
                    if (item.type === "income") totalIncomeBefore = Number(item.total) || 0;
                    if (item.type === "expense") totalExpenseBefore = Number(item.total) || 0;
                }

                return totalIncomeBefore - totalExpenseBefore;
            });
    }

    getOpeningBalanceByYear(user_id, year) {
        const firstDayOfYear = new Date(year, 0, 1);

        return Transaction.query()
            .where("user_id", user_id)
            .where("date", "<", firstDayOfYear)
            .select("type")
            .sum("amount as total")
            .groupBy("type")
            .then((rows) => {
                let totalIncomeBefore = 0;
                let totalExpenseBefore = 0;

                for (const item of rows) {
                    if (item.type === "income") totalIncomeBefore = Number(item.total) || 0;
                    if (item.type === "expense") totalExpenseBefore = Number(item.total) || 0;
                }

                return totalIncomeBefore - totalExpenseBefore;
            });
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

}

module.exports = new TransactionService();
