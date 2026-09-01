const express = require('express');
const deviceService = require('./device.service');
const historyStore = require('./history.store');
const devicesConfig = require('../../config/devices.config');

const router = express.Router();

// GET /api/devices
router.get('/', (req, res) => {
  const statuses = deviceService.getAllStatuses();
  // Merge type from config into each device status
  const withTypes = statuses.map(d => {
    const config = devicesConfig.find(c => c.deviceId === d.deviceId);
    return { ...d, type: config ? config.type : 'Unknown' };
  });
  res.status(200).json({
    status: 'success',
    data: withTypes
  });
});

// GET /api/devices/history
router.get('/history', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: historyStore.getHistory()
  });
});

module.exports = router;
