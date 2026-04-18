const Model = require("../config/objection");

class GroupTransaction extends Model {
    static get tableName() {
        return "group_transactions";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["group_id", "user_id", "type", "category", "amount", "date"],
            properties: {
                id:       { type: "integer" },
                group_id: { type: "integer" },
                user_id:  { type: "integer" },
                type:     { type: "string", enum: ["income", "expense"] },
                category: { type: "string" },
                amount:   { type: "number", minimum: 0.01 },
                note:     { type: ["string", "null"] },
                date:     { type: "string", format: "date" },
            },
        };
    }
}

module.exports = GroupTransaction;
