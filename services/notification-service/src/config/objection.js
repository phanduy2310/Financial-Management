const { Model } = require("objection");
const Knex = require("knex");
const knexConfig = require("./database");

const knex = Knex(knexConfig);
Model.knex(knex);

module.exports = Model;
