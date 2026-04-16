// models/savingInstallment.model.js
const Model = require("../config/objection");

class SavingInstallment extends Model {
    static get tableName() {
        return "saving_installments";
    }

    static get relationMappings() {
        const SavingPlan = require("./saving.model");
        return {
            plan: {
                relation: Model.BelongsToOneRelation,
                modelClass: SavingPlan,
                join: {
                    from: "saving_installments.saving_plan_id",
                    to: "saving_plans.id",
                },
            },
        };
    }
}

module.exports = SavingInstallment;
