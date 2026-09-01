const emailService = require('./email.service');
const logger = require('../../shared/logger');

class AlertService {
  constructor() {
    // Map to keep track of active alerts to prevent spamming
    // deviceId -> boolean
    this.activeAlerts = new Map();
  }

  handleSilence(device) {
    if (!this.activeAlerts.get(device.deviceId)) {
      logger.warn(`Device ${device.deviceId} is silent. Triggering alert.`);
      
      // Mark as alerted
      this.activeAlerts.set(device.deviceId, true);
      
      // Send email
      emailService.sendAlertEmail(device.deviceId, device.lastSeenAt, device.expectedIntervalMs);
    }
  }

  resolveAlert(deviceId) {
    if (this.activeAlerts.get(deviceId)) {
      logger.info(`Alert resolved for device ${deviceId}`);
      this.activeAlerts.set(deviceId, false);
      // Optional: send a "Resolved" email here
    }
  }
}

module.exports = new AlertService();
