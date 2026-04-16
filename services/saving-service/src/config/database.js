const path = require("path");
require("dotenv").config({ path: ".env.dev" });
console.log("Using DB:", process.env.MYSQL_DATABASE);

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  migrations: {
    directory: './src/migrations',
  },
};
