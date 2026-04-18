/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("saving_installments", (t) => {
        t.increments("id").primary();
        t.integer("saving_plan_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("saving_plans")
            .onDelete("CASCADE");

        t.decimal("amount", 12, 2).notNullable();
        t.string("note").nullable();

        // ✅ Chuyển sang datetime để dùng được default CURRENT_TIMESTAMP
        t.datetime("payment_date").defaultTo(knex.fn.now());

        t.timestamps(true, true); // created_at, updated_at
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("saving_installments");
};
