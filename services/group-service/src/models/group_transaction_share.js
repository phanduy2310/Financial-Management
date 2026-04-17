const Model = require("../config/objection");

class GroupTransactionShare extends Model {
    static get tableName() {
        return "group_transaction_shares";
    }
}

module.exports = GroupTransactionShare;
