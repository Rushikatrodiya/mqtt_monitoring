const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./shared/errors');
const logger = require('./shared/logger');

const deviceRoutes = require('./features/device-monitoring/device.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Incoming request`, { method: req.method, path: req.path });
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/devices', deviceRoutes);

app.all('*splat', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

app.use(errorHandler);

module.exports = app;
