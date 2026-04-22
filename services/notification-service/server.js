// Load .env.dev khi dev local, Railway tự inject env vars
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  require('dotenv').config({ path: '.env.dev' });
}
const app = require('./src/app');
const PORT = process.env.PORT || 8084;

app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
