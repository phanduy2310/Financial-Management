const Model = require("../config/objection");

class SavingPlan extends Model {
    static get tableName() {
        return "saving_plans";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: [
                "user_id",
                "title",
                "target_amount",
                "start_date",
                "end_date",
            ],
            properties: {
                id: { type: "integer" },
                user_id: { type: "integer" },
                title: { type: "string" },
                target_amount: { type: "number" },
                current_amount: { type: "number" },
                start_date: { type: "string", format: "date" },
                end_date: { type: "string", format: "date" },
                completed: { type: "boolean" },
                progress_percentage: { type: "number" },
            },
        };
    }
}

module.exports = SavingPlan;
