/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("installment_payments", (table) => {
        table.increments("id").primary();
        table
            .integer("plan_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("installment_plans")
            .onDelete("CASCADE");
        table.integer("term_number").notNullable();
        table.decimal("amount", 12, 2).notNullable();
        table.string("note").nullable();
        table.dateTime("pay_date").notNullable().defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("installment_payments");
};
