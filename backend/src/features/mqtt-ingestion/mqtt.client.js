const mqtt = require('mqtt');
const env = require('../../config/env.config');
const logger = require('../../shared/logger');
const mqttHandler = require('./mqtt.handler');

class MqttClient {
  constructor() {
    this.client = null;
  }

  connect() {
    logger.info(`Connecting to MQTT broker at ${env.MQTT_URL}...`);
    this.client = mqtt.connect(env.MQTT_URL);

    this.client.on('connect', () => {
      logger.info('Connected to MQTT broker successfully.');
      
      // Subscribe to all device topics for the prototype
      // e.g. devices/+/status
      const topic = 'devices/+/status';
      this.client.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to ${topic}`, { error: err.message });
        } else {
          logger.info(`Subscribed to topic: ${topic}`);
        }
      });
    });

    this.client.on('message', (topic, message) => {
      try {
        mqttHandler.handleMessage(topic, message);
      } catch (err) {
        logger.error(`Error handling MQTT message on topic ${topic}`, { error: err.message });
      }
    });

    this.client.on('error', (err) => {
      logger.error('MQTT Client Error', { error: err.message });
    });

    this.client.on('offline', () => {
      logger.warn('MQTT Client is offline.');
    });

    this.client.on('reconnect', () => {
      logger.info('MQTT Client is reconnecting...');
    });
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      logger.info('Disconnected from MQTT broker.');
    }
  }
}

module.exports = new MqttClient();
