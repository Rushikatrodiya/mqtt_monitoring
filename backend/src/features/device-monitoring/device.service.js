const deviceStore = require('./device.store');
const devicesConfig = require('../../config/devices.config');
const logger = require('../../shared/logger');

class DeviceService {
  /**
   * Called when a new MQTT message is received for a device.
   * Updates lastSeen and flips status to ONLINE.
   */
  registerMessage(deviceId) {
    // Only track configured devices
    const isConfigured = devicesConfig.find(d => d.deviceId === deviceId);
    if (!isConfigured) {
      logger.debug(`Ignored message from unconfigured device: ${deviceId}`);
      return;
    }

    const timestamp = new Date().toISOString();
    deviceStore.upsertLastSeen(deviceId, timestamp);
    deviceStore.setStatus(deviceId, 'ONLINE');
    logger.debug(`Device ${deviceId} registered message. Status: ONLINE`);
  }

  /**
   * Returns all known statuses for the API/dashboard.
   * Merges with configured devices to include devices that haven't sent a message yet.
   */
  getAllStatuses() {
    const activeDevices = deviceStore.getAll();
    const activeDeviceIds = activeDevices.map(d => d.deviceId);
    
    // Add devices that are in config but haven't been seen yet
    const allStatuses = [...activeDevices];
    devicesConfig.forEach(configDevice => {
      if (!activeDeviceIds.includes(configDevice.deviceId)) {
        allStatuses.push({
          deviceId: configDevice.deviceId,
          status: 'UNKNOWN',
          lastSeenAt: null
        });
      }
    });
    
    // Attach expected intervals for frontend use
    return allStatuses.map(d => {
      const config = devicesConfig.find(c => c.deviceId === d.deviceId);
      return {
        ...d,
        expectedIntervalMs: config ? config.expectedIntervalMs : null
      };
    });
  }
}

module.exports = new DeviceService();
