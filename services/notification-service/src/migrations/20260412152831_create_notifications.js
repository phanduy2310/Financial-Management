exports.up = function (knex) {
  return knex.schema.createTable("notifications", (table) => {
    table.bigIncrements("id").primary();

    table.bigInteger("user_id").notNullable().index();

    table.string("source_service", 50);
    table.string("event", 50).notNullable();

    table.string("title", 255).notNullable();
    table.text("message").notNullable();

    table.json("data");

    table.json("channels").notNullable();

    table.integer("priority").defaultTo(0);

    table.boolean("is_read").defaultTo(false);
    table.timestamp("read_at");

    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["user_id", "is_read", "created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("notifications");
};
