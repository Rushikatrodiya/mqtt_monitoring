const emailService = require('./email.service');
const logger = require('../../shared/logger');

function createAlertService() {
  const activeAlerts = new Map();

  return {
    handleSilence(device) {
      if (!activeAlerts.get(device.deviceId)) {
        logger.warn(`Device ${device.deviceId} is silent. Triggering alert.`);
        activeAlerts.set(device.deviceId, true);
        emailService.sendAlertEmail(device.deviceId, device.lastSeenAt, device.expectedIntervalMs);
      }
    },

    resolveAlert(deviceId) {
      if (activeAlerts.get(deviceId)) {
        logger.info(`Alert resolved for device ${deviceId}`);
        activeAlerts.set(deviceId, false);
      }
    },

    _reset() {
      activeAlerts.clear();
    },

    _getActiveAlerts() {
      return activeAlerts;
    }
  };
}

module.exports = createAlertService();
