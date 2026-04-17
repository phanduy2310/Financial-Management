const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const notificationRoutes = require("./routes/notification.route");
const internalRoutes = require("./routes/internal.route");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/notification", notificationRoutes);
app.use("/internal", internalRoutes);
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.send("Notification Service is running 🚀"));

module.exports = app;
