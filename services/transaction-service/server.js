require("dotenv").config({ path: ".env.dev" });
const app = require('./app');
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Transaction Service running on port ${PORT}`));
