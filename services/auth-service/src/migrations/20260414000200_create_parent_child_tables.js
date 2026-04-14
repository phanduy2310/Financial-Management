/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("parent_child_links", (table) => {
        table.increments("id").primary();
        table.integer("parent_id").notNullable();
        table.integer("child_id").notNullable();
        table
            .enu("status", ["pending", "accepted", "rejected"], {
                useNative: false,
                enumName: "parent_child_status",
            })
            .notNullable()
            .defaultTo("pending");
        table.timestamp("accepted_at").nullable();
        table.timestamps(true, true);
        table.unique(["parent_id", "child_id"]);
    });

    await knex.schema.createTable("parent_child_tokens", (table) => {
        table.increments("id").primary();
        table
            .integer("parent_child_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("parent_child_links")
            .onDelete("CASCADE");
        table.string("token").notNullable().unique();
        table.dateTime("expired_at").notNullable();
        table.boolean("used").notNullable().defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("parent_child_tokens");
    await knex.schema.dropTableIfExists("parent_child_links");
};
