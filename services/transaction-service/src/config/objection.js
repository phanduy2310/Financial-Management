import { Model } from 'objection';
import Knex from 'knex';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const knexConfig = require('./database.js');

const knex = Knex(knexConfig);
Model.knex(knex);

export default Model;
