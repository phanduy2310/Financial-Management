const Model = require("../config/objection");

class InstallmentPayment extends Model {
    static get tableName() {
        return "installment_payments";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["plan_id", "term_number", "amount", "pay_date"],
            properties: {
                id: { type: "integer" },
                plan_id: { type: "integer" },
                term_number: { type: "integer" },
                amount: { type: "number" },
                note: { type: ["string", "null"] },
                pay_date: { type: "string", format: "date-time" },
                created_at: { type: "string", format: "date-time" },
            },
        };
    }
}

module.exports = InstallmentPayment;
