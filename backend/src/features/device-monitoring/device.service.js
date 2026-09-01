const deviceStore = require('./device.store');
const devicesConfig = require('../../config/devices.config');
const logger = require('../../shared/logger');

function createDeviceService() {
  return {
    registerMessage(deviceId) {
      const isConfigured = devicesConfig.find(d => d.deviceId === deviceId);
      if (!isConfigured) {
        logger.debug(`Ignored message from unconfigured device: ${deviceId}`);
        return;
      }

      const timestamp = new Date().toISOString();
      deviceStore.upsertLastSeen(deviceId, timestamp);
      deviceStore.setStatus(deviceId, 'ONLINE');
      logger.debug(`Device ${deviceId} registered message. Status: ONLINE`);
    },

    getAllStatuses() {
      const activeDevices = deviceStore.getAll();
      const activeDeviceIds = activeDevices.map(d => d.deviceId);

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

      return allStatuses.map(d => {
        const config = devicesConfig.find(c => c.deviceId === d.deviceId);
        return {
          ...d,
          expectedIntervalMs: config ? config.expectedIntervalMs : null
        };
      });
    }
  };
}

module.exports = createDeviceService();
