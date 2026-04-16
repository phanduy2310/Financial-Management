exports.up = async function (knex) {
  await knex.schema.alterTable('saving_plans', (t) => {
    t.decimal('progress_percentage', 5, 2).defaultTo(0);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('saving_plans', (t) => {
    t.dropColumn('progress_percentage');
  });
};
