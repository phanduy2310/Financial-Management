require("dotenv").config({ path: ".env.dev" });
const app = require('./src/app');
const PORT = process.env.PORT || 8083;

app.listen(PORT, () => console.log(`🚀 Saving Service running on port ${PORT}`));
