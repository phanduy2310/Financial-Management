const Model = require("../config/objection");

class Group extends Model {
    static get tableName() {
        return "groups";
    }
}

module.exports = Group;
