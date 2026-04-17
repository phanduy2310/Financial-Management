const Group = require("../models/group");
const { transaction } = require("objection");
const GroupMember = require("../models/group_member");

class GroupService {

    createGroupWithOwner = async ({ name, description, owner_id }) => {
        return transaction(Group.knex(), async (trx) => {
            const group = await Group.query(trx).insert({
                name,
                description,
                owner_id
            });

            await GroupMember.query(trx).insert({
                group_id: group.id,
                user_id: owner_id,
                role: "owner"
            });

            return group;
        });
    };

    update(id, data) {
        return Group.query().findById(id).patch(data);
    }

    delete(id) {
        return Group.query().deleteById(id);
    }

    getGroupById(id) {
        return Group.query().findById(id);
    }

    getGroupsOfUser(user_id) {
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
