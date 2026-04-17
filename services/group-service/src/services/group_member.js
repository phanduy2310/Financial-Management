const GroupMember = require("../models/group_member");

class GroupMemberService {
    async addMember(group_id, user_id, role = "member") {
        return GroupMember.query().insert({
            group_id,
            user_id,
            role,
        });
    }

    async removeMember(group_id, user_id) {
        return GroupMember.query().delete().where({ group_id, user_id });
    }

    async getMember(group_id, user_id) {
        return GroupMember.query().findOne({ group_id, user_id });
    }

    async getMembers(group_id) {
        return GroupMember.query().where("group_id", group_id);
    }
}

module.exports = new GroupMemberService();
