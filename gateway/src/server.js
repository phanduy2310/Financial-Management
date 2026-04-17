require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authProxy = require("./routes/auth.proxy");
const transactionProxy = require("./routes/transaction.proxy");
const savingProxy = require("./routes/saving.proxy");
const notificationProxy = require("./routes/notification.proxy");
const groupProxy = require("./routes/group.proxy");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Proxy routes
app.use("/api/auth", authProxy);
app.use("/api/parent", authProxy);
app.use("/api/transactions", transactionProxy);
app.use("/api/budget", transactionProxy);
app.use("/api/saving", savingProxy);
app.use("/api/installment", savingProxy);
app.use("/api/notification", notificationProxy);
app.use("/api/groups", groupProxy);
app.use("/api/group-members", groupProxy);
app.use("/api/group-transactions", groupProxy);

const PORT = process.env.PORT || 5444;
app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));
