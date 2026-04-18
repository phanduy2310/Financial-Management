const Model = require("../config/objection");

class Group extends Model {
    static get tableName() {
        return "groups";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["name", "owner_id"],
            properties: {
                id:          { type: "integer" },
                name:        { type: "string", maxLength: 255 },
                description: { type: ["string", "null"] },
                owner_id:    { type: "integer" },
            },
        };
    }
}

module.exports = Group;
