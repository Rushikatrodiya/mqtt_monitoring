const nodemailer = require('nodemailer');
const env = require('../../config/env.config');
const logger = require('../../shared/logger');

function createEmailService() {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  return {
    async sendAlertEmail(deviceId, lastSeenAt, expectedIntervalMs) {
      const mailOptions = {
        from: env.ALERT_EMAIL_FROM,
        to: env.ALERT_EMAIL_TO,
        subject: `🚨 ALERT: Device ${deviceId} is OFFLINE`,
        text: `Device ${deviceId} has gone silent.\n\nLast seen at: ${lastSeenAt || 'Never'}\nExpected interval: ${expectedIntervalMs}ms\n\nPlease check the device immediately.`,
        html: `
          <h2>🚨 Device Offline Alert</h2>
          <p><strong>Device ID:</strong> ${deviceId}</p>
          <p><strong>Last Seen At:</strong> ${lastSeenAt || 'Never'}</p>
          <p><strong>Expected Interval:</strong> ${expectedIntervalMs} ms</p>
          <p>Please check the device immediately.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        logger.info(`Alert email sent for device ${deviceId}`);
      } catch (error) {
        logger.error(`Failed to send alert email for device ${deviceId}`, { error: error.message });
      }
    }
  };
}

module.exports = createEmailService();
