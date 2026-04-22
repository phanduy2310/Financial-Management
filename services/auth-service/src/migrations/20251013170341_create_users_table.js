/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTableIfNotExists("users", (table) => {
        table.increments("id").primary();
        table.string("fullname").notNullable();
        table.string("email").unique().notNullable();
        table.string("password").notNullable();
        table.string("role").notNullable().defaultTo("user");
        table.text("refresh_token").nullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("users");
};
