/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("groups", (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.text("description").nullable();
        table.integer("owner_id").unsigned().notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable("group_members", (table) => {
        table.increments("id").primary();
        table
            .integer("group_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("groups")
            .onDelete("CASCADE");
        table.integer("user_id").unsigned().notNullable();
        table.string("role").notNullable().defaultTo("member");
        table.timestamps(true, true);
        table.unique(["group_id", "user_id"]);
    });

    await knex.schema.createTable("group_transactions", (table) => {
        table.increments("id").primary();
        table
            .integer("group_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("groups")
            .onDelete("CASCADE");
        table.integer("user_id").unsigned().notNullable();
        table.enu("type", ["income", "expense"]).notNullable();
        table.string("category").notNullable();
        table.decimal("amount", 12, 2).notNullable();
        table.text("note").nullable();
        table.date("date").notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable("group_transaction_shares", (table) => {
        table.increments("id").primary();
        table
            .integer("transaction_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("group_transactions")
            .onDelete("CASCADE");
        table.integer("user_id").unsigned().notNullable();
        table.decimal("amount", 12, 2).notNullable();
        table.timestamps(true, true);
        table.unique(["transaction_id", "user_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("group_transaction_shares");
    await knex.schema.dropTableIfExists("group_transactions");
    await knex.schema.dropTableIfExists("group_members");
    await knex.schema.dropTableIfExists("groups");
};
