const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const savingRoutes = require('./routes/saving.route');
const installmentRoutes = require('./routes/installment.route');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/saving', savingRoutes);
app.use('/api/installment', installmentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
