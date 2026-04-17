const Model = require("../config/objection");

class ParentChildToken extends Model {
    static get tableName() {
        return "parent_child_tokens";
    }

    static get idColumn() {
        return "id";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["parent_child_id", "token", "expired_at"],

            properties: {
                id: { type: "integer" },
                parent_child_id: { type: "integer" },
                token: { type: "string" },
                expired_at: { type: "string", format: "date-time" },
                used: { type: "boolean" },
                created_at: { type: "string" },
            },
        };
    }
}

module.exports = ParentChildToken;
