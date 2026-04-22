require('dotenv').config({ path: require('path').join(__dirname, '../../.env.dev') });
// Load .env.dev khi dev local, Railway tự inject env vars
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env.dev') });
}
const path = require('path');

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  migrations: {
    directory: path.join(__dirname, '../migrations'),
  },
  seeds: {
    directory: path.join(__dirname, '../seeds'),
  },
};
