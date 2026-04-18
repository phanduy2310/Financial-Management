/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("saving_plans", (t) => {
        t.increments("id").primary();
        t.integer("user_id").notNullable(); // ID người dùng từ auth-service
        t.string("title").notNullable(); // Tên kế hoạch
        t.decimal("target_amount", 12, 2).notNullable(); // Số tiền mục tiêu
        t.decimal("current_amount", 12, 2).defaultTo(0); // Số tiền hiện có
        t.date("start_date").notNullable();
        t.date("end_date").notNullable();
        t.boolean("completed").defaultTo(false);
        t.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("saving_plans");
};
