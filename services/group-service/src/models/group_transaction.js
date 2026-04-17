const Model = require("../config/objection");

class GroupTransaction extends Model {
    static get tableName() {
        return "group_transactions";
    }
}

module.exports = GroupTransaction;
