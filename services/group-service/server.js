require("dotenv").config({ path: ".env.dev" });
const app = require('./src/app');

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🚀 Group Service running on port ${PORT}`));
