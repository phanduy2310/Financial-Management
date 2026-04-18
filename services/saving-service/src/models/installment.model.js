const Model = require("../config/objection");

class InstallmentPlan extends Model {
    static get tableName() {
        return "installment_plans";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: [
                "user_id",
                "title",
                "total_amount",
                "monthly_payment",
                "start_date",
                "end_date",
                "total_terms",
            ],
            properties: {
                id: { type: "integer" },
                user_id: { type: "integer" },
                title: { type: "string" },
                total_amount: { type: "number" },
                paid_amount: { type: "number" },
                monthly_payment: { type: "number" },
                start_date: { type: "string", format: "date" },
                end_date: { type: "string", format: "date" },
                current_term: { type: "integer" },
                total_terms: { type: "integer" },
                completed: { type: "boolean" },
                progress_percentage: { type: "number" },
            },
        };
    }
}

module.exports = InstallmentPlan;
