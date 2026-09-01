const mqtt = require('mqtt');
const env = require('../../config/env.config');
const logger = require('../../shared/logger');
const mqttHandler = require('./mqtt.handler');

function createMqttClient() {
  let client = null;

  return {
    connect() {
      logger.info(`Connecting to MQTT broker at ${env.MQTT_URL}...`);
      client = mqtt.connect(env.MQTT_URL);

      client.on('connect', () => {
        logger.info('Connected to MQTT broker successfully.');
        const topic = 'devices/+/status';
        client.subscribe(topic, (err) => {
          if (err) {
            logger.error(`Failed to subscribe to ${topic}`, { error: err.message });
          } else {
            logger.info(`Subscribed to topic: ${topic}`);
          }
        });
      });

      client.on('message', (topic, message) => {
        try {
          mqttHandler.handleMessage(topic, message);
        } catch (err) {
          logger.error(`Error handling MQTT message on topic ${topic}`, { error: err.message });
        }
      });

      client.on('error', (err) => {
        logger.error('MQTT Client Error', { error: err.message });
      });

      client.on('offline', () => {
        logger.warn('MQTT Client is offline.');
      });

      client.on('reconnect', () => {
        logger.info('MQTT Client is reconnecting...');
      });
    },

    disconnect() {
      if (client) {
        client.end();
        logger.info('Disconnected from MQTT broker.');
      }
    }
  };
}

module.exports = createMqttClient();
