require('dotenv').config({ path: '.env.dev' });

// Load .env.dev khi dev local, Railway tự inject env vars
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  require('dotenv').config({ path: '.env.dev' });
}

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
