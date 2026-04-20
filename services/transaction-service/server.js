require("dotenv").config({ path: ".env.dev" });
const app = require('./app');
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => console.log(`🚀 Transaction Service running on port ${PORT}`));
