const mqtt = require('mqtt');
require('dotenv').config();

const brokerUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
console.log(`Connecting simulator to ${brokerUrl}...`);
const client = mqtt.connect(brokerUrl);

const devices = [
  { deviceId: 'sensor_001', interval: 10000, name: 'Main Gate Sensor' },
  { deviceId: 'sensor_002', interval: 15000, name: 'Warehouse Temp' },
  { deviceId: 'sensor_003', interval: 5000, name: 'Server Room Humidity', silentAfter: 20000 } // This one will intentionally go silent
];

client.on('connect', () => {
  console.log('Simulator connected to broker.');

  devices.forEach(device => {
    let publishCount = 0;
    const timer = setInterval(() => {
      // Check if this device is supposed to go silent for demo purposes
      if (device.silentAfter && (publishCount * device.interval >= device.silentAfter)) {
        console.log(`[SIMULATOR] Device ${device.deviceId} going SILENT for demo purposes.`);
        clearInterval(timer);
        return;
      }

      const topic = `devices/${device.deviceId}/status`;
      const message = JSON.stringify({
        status: 'alive',
        timestamp: new Date().toISOString(),
        battery: Math.floor(Math.random() * 100)
      });

      client.publish(topic, message, (err) => {
        if (err) {
          console.error(`[SIMULATOR] Error publishing for ${device.deviceId}`, err);
        } else {
          console.log(`[SIMULATOR] Published to ${topic}`);
        }
      });

      publishCount++;
    }, device.interval);
  });
});
