const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const transactionRoutes = require('./src/routes/transaction');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/transactions', transactionRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
