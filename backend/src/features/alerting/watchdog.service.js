const deviceService = require('../device-monitoring/device.service');
const deviceStore = require('../device-monitoring/device.store');
const alertService = require('./alert.service');
const historyStore = require('../device-monitoring/history.store');
const logger = require('../../shared/logger');

function createWatchdogService() {
  let intervalId = null;
  const scanIntervalMs = 5000;

  return {
    start() {
      if (intervalId) return;

      logger.info(`Starting watchdog service (scan interval: ${scanIntervalMs}ms)`);
      intervalId = setInterval(() => this.scan(), scanIntervalMs);
    },

    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        logger.info('Watchdog service stopped');
      }
    },

    scan() {
      const devices = deviceService.getAllStatuses();
      const now = new Date().getTime();

      devices.forEach(device => {
        if (!device.expectedIntervalMs) return;

        if (device.status === 'UNKNOWN' || !device.lastSeenAt) {
          deviceStore.setStatus(device.deviceId, 'OFFLINE');
          alertService.handleSilence(device);
          return;
        }

        const lastSeenTime = new Date(device.lastSeenAt).getTime();
        const timeSinceLastMessage = now - lastSeenTime;
        const threshold = device.expectedIntervalMs + 2000;

        if (timeSinceLastMessage > threshold) {
          if (device.status !== 'OFFLINE') {
            deviceStore.setStatus(device.deviceId, 'OFFLINE');
          }
          alertService.handleSilence(device);
        } else {
          if (device.status !== 'ONLINE') {
            deviceStore.setStatus(device.deviceId, 'ONLINE');
          }
          alertService.resolveAlert(device.deviceId);
        }
      });

      const allStatuses = deviceService.getAllStatuses();
      const onlineCount = allStatuses.filter(d => d.status === 'ONLINE').length;
      historyStore.recordSnapshot(onlineCount, allStatuses.length);
    }
  };
}

module.exports = createWatchdogService();
