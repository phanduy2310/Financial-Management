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

    async getOpeningBalanceByMonth(user_id, month, year) {
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

    async getOpeningBalanceByYear(user_id, year) {
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

    async getMonthlySummary(user_id, months) {
        const rows = await Transaction.query()
            .where("user_id", user_id)
            .whereRaw(
                `date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL ? MONTH)`,
                [months - 1]
            )
            .select(Transaction.raw("YEAR(date) as year"))
            .select(Transaction.raw("MONTH(date) as month"))
            .select("type")
            .sum("amount as total")
            .groupByRaw("YEAR(date), MONTH(date), type")
            .orderByRaw("YEAR(date), MONTH(date)");

        const map = new Map();

        for (const item of rows) {
            const year = Number(item.year);
            const month = Number(item.month);
            const key = `${year}-${month}`;

            if (!map.has(key)) {
                map.set(key, {
                    year,
                    month,
                    total_income: 0,
                    total_expense: 0
                });
            }

            const current = map.get(key);

            if (item.type === "income") {
                current.total_income = Number(item.total) || 0;
            }

            if (item.type === "expense") {
                current.total_expense = Number(item.total) || 0;
            }
        }

        const now = new Date();
        const result = [];

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const key = `${year}-${month}`;

            result.push(
                map.get(key) || {
                    year,
                    month,
                    total_income: 0,
                    total_expense: 0
                }
            );
        }

        return result;
    }

}

module.exports = new TransactionService();
