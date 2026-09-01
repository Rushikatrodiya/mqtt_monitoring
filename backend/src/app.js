const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./shared/errors');
const logger = require('./shared/logger');

// We will import routes here later
const deviceRoutes = require('./features/device-monitoring/device.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming request`, { method: req.method, path: req.path });
  next();
});

// Basic liveness check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/devices', deviceRoutes);

// Unhandled route fallback
app.all('*splat', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
