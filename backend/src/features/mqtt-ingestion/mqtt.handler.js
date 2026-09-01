const deviceService = require('../device-monitoring/device.service');
const logger = require('../../shared/logger');

function createMqttHandler() {
  return {
    handleMessage(topic) {
      const topicParts = topic.split('/');

      if (topicParts.length !== 3 || topicParts[0] !== 'devices' || topicParts[2] !== 'status') {
        logger.debug(`Ignored message on unknown topic structure: ${topic}`);
        return;
      }

      const deviceId = topicParts[1];
      deviceService.registerMessage(deviceId);
    }
  };
}

module.exports = createMqttHandler();
