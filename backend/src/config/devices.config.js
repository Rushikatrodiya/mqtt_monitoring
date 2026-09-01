// The single source of truth for which devices exist and their expected intervals.
// Replacing a DB-backed device table for this prototype.

const devices = [
  {
    deviceId: 'sensor_001',
    type: 'Temperature',
    expectedIntervalMs: 10000 // Expects a message every 10 seconds
  },
  {
    deviceId: 'sensor_002',
    type: 'Humidity',
    expectedIntervalMs: 15000 // Expects a message every 15 seconds
  },
  {
    deviceId: 'sensor_003',
    type: 'Pressure',
    expectedIntervalMs: 5000 // Expects a message every 5 seconds
  }
];

module.exports = devices;
