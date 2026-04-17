const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const groupRoutes = require('./routes/group');
const memberRoutes = require('./routes/group_member');
const transactionRoutes = require('./routes/group_transaction');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/groups', groupRoutes);
app.use('/api/group-members', memberRoutes);
app.use('/api/group-transactions', transactionRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;