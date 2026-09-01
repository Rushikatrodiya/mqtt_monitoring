const app = require('./app');
const env = require('./config/env.config');
const logger = require('./shared/logger');

// We will initialize MQTT and Watchdog here later
const mqttClient = require('./features/mqtt-ingestion/mqtt.client');
const watchdogService = require('./features/alerting/watchdog.service');

const port = env.PORT;

const server = app.listen(port, () => {
  logger.info(`App running on port ${port}...`);
  
  // Start other services
  mqttClient.connect();
  watchdogService.start();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { error: err.name, message: err.message });
  server.close(() => {
    process.exit(1);
  });
});
