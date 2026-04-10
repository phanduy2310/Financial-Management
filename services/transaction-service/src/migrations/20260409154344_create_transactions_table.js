/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("transactions", (t) => {
        t.increments("id").primary();
        t.integer("user_id").notNullable();
        t.string("type").notNullable();       // income | expense
        t.string("category").notNullable();   // ăn uống, học tập, v.v.
        t.decimal("amount", 10, 2).notNullable();
        t.date("date").notNullable();
        t.string("note");
        t.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("transactions");
};
