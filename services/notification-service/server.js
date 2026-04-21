require("dotenv").config();
const app = require('./src/app');
const PORT = process.env.PORT || 8084;

app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
