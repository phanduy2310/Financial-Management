const Model = require("../config/objection");
const User = require("./user.model");

class ParentChild extends Model {
    static get tableName() {
        return "parent_child_links";
    }

    static get relationMappings() {
        return {
            child: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "parent_child_links.child_id",
                    to: "users.id",
                },
            },
            parent: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "parent_child_links.parent_id",
                    to: "users.id",
                },
            },
        };
    }
}

module.exports = ParentChild;
