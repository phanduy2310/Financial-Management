/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();                        // AUTO_INCREMENT PK
    table.integer('user_id').unsigned().notNullable();       // FK tới user
    table.decimal('amount', 15, 2).notNullable();            // số tiền
    table.enum('type', ['income', 'expense']).notNullable(); // loại giao dịch
    table.string('category', 100).nullable();                // danh mục giao dịch
    table.string('description', 255).nullable();
    table.date('transaction_date').notNullable();
    table.timestamps(true, true);                            // created_at, updated_at
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('transactions');
}
