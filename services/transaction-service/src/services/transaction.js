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
        return Transaction.query().findById(id).patch(data);
    }

    delete(id) {
        return Transaction.query().deleteById(id);
    }

}

module.exports = new TransactionService();
