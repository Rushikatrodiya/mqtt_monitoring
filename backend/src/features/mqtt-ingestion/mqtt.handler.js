const deviceService = require('../device-monitoring/device.service');
const logger = require('../../shared/logger');

class MqttHandler {
  /**
   * Parses the topic to extract deviceId and delegates to device service.
   * Expected topic format: devices/{deviceId}/status
   */
  handleMessage(topic, messageBuffer) {
    const topicParts = topic.split('/');
    
    // Validate topic structure
    if (topicParts.length !== 3 || topicParts[0] !== 'devices' || topicParts[2] !== 'status') {
      logger.debug(`Ignored message on unknown topic structure: ${topic}`);
      return;
    }

    const deviceId = topicParts[1];
    
    // For this prototype we don't necessarily need the payload if just 
    // the act of publishing means the device is alive, but we can parse it if needed.
    // const payload = messageBuffer.toString();

    deviceService.registerMessage(deviceId);
  }
}

module.exports = new MqttHandler();
