const Group = require("../models/group");

class GroupService {
    async create(data) {
        return Group.query().insert(data);
    }

    async update(id, data) {
        return Group.query().findById(id).patch(data);
    }

    async delete(id) {
        return Group.query().deleteById(id);
    }

    async getGroupById(id) {
        return Group.query().findById(id);
    }

    async getGroupsOfUser(user_id) {
        const knex = Group.knex();
        return Group.query()
            .join("group_members as gm_user", "groups.id", "gm_user.group_id")
            .where("gm_user.user_id", user_id)
            .select(
                "groups.*",
                knex("group_members")
                    .count("*")
                    .whereRaw("group_members.group_id = groups.id")
                    .as("member_count")
            );
    }
}

module.exports = new GroupService();
