/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("installment_plans", (table) => {
        table.increments("id").primary();
        table.integer("user_id").notNullable();
        table.string("title").notNullable();
        table.decimal("total_amount", 12, 2).notNullable();
        table.decimal("paid_amount", 12, 2).notNullable().defaultTo(0);
        table.decimal("monthly_payment", 12, 2).notNullable();
        table.date("start_date").notNullable();
        table.date("end_date").notNullable();
        table.integer("current_term").notNullable().defaultTo(0);
        table.integer("total_terms").notNullable();
        table.boolean("completed").notNullable().defaultTo(false);
        table.decimal("progress_percentage", 5, 2).notNullable().defaultTo(0);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("installment_plans");
};
