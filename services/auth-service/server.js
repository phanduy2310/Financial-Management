require("dotenv").config({ path: ".env.dev" });
const app = require('./src/app');

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`🚀 Auth Service running on port ${PORT}`));
