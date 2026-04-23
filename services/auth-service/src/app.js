const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.route");
const parentChildRoutes = require("./routes/parent_child.route");

const app = express();

// Service chỉ nhận request từ gateway (internal network) — không cần CORS
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/parent", parentChildRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
