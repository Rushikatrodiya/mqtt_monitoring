const devices = [
  {
    deviceId: 'sensor_001',
    name: 'Temperature Sensor',
    type: 'Temperature',
    expectedIntervalMs: 10000 // Expects a message every 10 seconds
  },
  {
    deviceId: 'sensor_002',
    name: 'Humidity Sensor',
    type: 'Humidity',
    expectedIntervalMs: 15000 // Expects a message every 15 seconds
  },
  {
    deviceId: 'sensor_003',
    name: 'Pressure Sensor',
    type: 'Pressure',
    expectedIntervalMs: 5000 // Expects a message every 5 seconds
  }
];

module.exports = devices;
