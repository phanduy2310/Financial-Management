const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('./database.js');

const knex = Knex(knexConfig);
Model.knex(knex);

module.exports = Model;
