const dotenv = require('dotenv');

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  MQTT_URL: process.env.MQTT_URL || 'mqtt://localhost:1883',
  SMTP_HOST: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  SMTP_PORT: process.env.SMTP_PORT || 2525,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM || 'alerts@example.com',
  ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO || 'admin@example.com'
};

module.exports = env;
