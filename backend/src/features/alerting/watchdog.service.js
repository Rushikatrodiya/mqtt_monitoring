const deviceService = require('../device-monitoring/device.service');
const deviceStore = require('../device-monitoring/device.store');
const alertService = require('./alert.service');
const historyStore = require('../device-monitoring/history.store');
const logger = require('../../shared/logger');

class WatchdogService {
  constructor() {
    this.intervalId = null;
    this.scanIntervalMs = 5000; // Check every 5 seconds
  }

  start() {
    if (this.intervalId) return;

    logger.info(`Starting watchdog service (scan interval: ${this.scanIntervalMs}ms)`);
    this.intervalId = setInterval(() => this.scan(), this.scanIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Watchdog service stopped');
    }
  }

  scan() {
    const devices = deviceService.getAllStatuses();
    const now = new Date().getTime();

    devices.forEach(device => {
      // If expectedIntervalMs is missing, we can't monitor it
      if (!device.expectedIntervalMs) return;

      // Device hasn't been seen yet, but it's configured
      if (device.status === 'UNKNOWN' || !device.lastSeenAt) {
        // We could alert here, or wait until it comes online at least once.
        // For now, let's treat it as offline if it hasn't checked in initially.
        deviceStore.setStatus(device.deviceId, 'OFFLINE');
        alertService.handleSilence(device);
        return;
      }

      const lastSeenTime = new Date(device.lastSeenAt).getTime();
      const timeSinceLastMessage = now - lastSeenTime;

      // Add a small buffer (e.g., 2 seconds) to avoid false positives due to network jitter
      const threshold = device.expectedIntervalMs + 2000;

      if (timeSinceLastMessage > threshold) {
        // Device missed its check-in
        if (device.status !== 'OFFLINE') {
          deviceStore.setStatus(device.deviceId, 'OFFLINE');
        }
        alertService.handleSilence(device);
      } else {
        // Device is healthy
        if (device.status !== 'ONLINE') {
          deviceStore.setStatus(device.deviceId, 'ONLINE');
        }
        alertService.resolveAlert(device.deviceId);
      }
    });

    // Record a fleet health snapshot after every scan
    const allStatuses = deviceService.getAllStatuses();
    const onlineCount = allStatuses.filter(d => d.status === 'ONLINE').length;
    historyStore.recordSnapshot(onlineCount, allStatuses.length);
  }
}

module.exports = new WatchdogService();
