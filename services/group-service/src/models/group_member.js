const Model = require("../config/objection");

class GroupMember extends Model {
    static get tableName() {
        return "group_members";
    }
}

module.exports = GroupMember;
