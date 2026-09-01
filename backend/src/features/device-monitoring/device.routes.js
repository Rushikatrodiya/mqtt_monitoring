const express = require('express');
const deviceService = require('./device.service');
const historyStore = require('./history.store');
const devicesConfig = require('../../config/devices.config');

const router = express.Router();

router.get('/', (req, res) => {
  const statuses = deviceService.getAllStatuses();
  // Merge type from config into each device status
  const withTypes = statuses.map(d => {
    const config = devicesConfig.find(c => c.deviceId === d.deviceId);
    return { ...d, type: config ? config.type : 'Unknown', name: config ? config.name : d.deviceId };
  });
  res.status(200).json({
    status: 'success',
    data: withTypes
  });
});

router.get('/history', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: historyStore.getHistory()
  });
});

router.post('/reset', (req, res) => {
  // Clear chart history and reset all configured devices to ONLINE 
  historyStore.clearHistory();
  const now = new Date().toISOString();
  const deviceStore = require('./device.store');
  devicesConfig.forEach(({ deviceId }) => {
    deviceStore.upsertLastSeen(deviceId, now);
    deviceStore.setStatus(deviceId, 'ONLINE');
  });
  res.status(200).json({
    status: 'success',
    message: 'Demo reset'
  });
});

module.exports = router;
