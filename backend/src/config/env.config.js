const dotenv = require('dotenv');

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  MQTT_URL: process.env.MQTT_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM,
  ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO
};

module.exports = config;
