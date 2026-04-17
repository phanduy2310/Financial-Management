require("dotenv").config({ path: ".env.dev" });
const app = require('./src/app');
const PORT = process.env.PORT || 8084;

app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
