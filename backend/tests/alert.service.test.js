const alertService = require('../src/features/alerting/alert.service');
const emailService = require('../src/features/alerting/email.service');

jest.mock('../src/features/alerting/email.service');
jest.mock('../src/shared/logger');

describe('AlertService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alertService._reset();
  });

  describe('handleSilence', () => {
    it('should send email and mark alert as active', () => {
      const device = { deviceId: 'test_dev', lastSeenAt: '2023', expectedIntervalMs: 5000 };

      alertService.handleSilence(device);

      expect(alertService._getActiveAlerts().get('test_dev')).toBe(true);
      expect(emailService.sendAlertEmail).toHaveBeenCalledWith('test_dev', '2023', 5000);
    });

    it('should not send email if alert is already active', () => {
      const device = { deviceId: 'test_dev', lastSeenAt: '2023', expectedIntervalMs: 5000 };
      alertService._getActiveAlerts().set('test_dev', true);

      alertService.handleSilence(device);

      expect(emailService.sendAlertEmail).not.toHaveBeenCalled();
    });
  });

  describe('resolveAlert', () => {
    it('should mark alert as resolved if it was active', () => {
      alertService._getActiveAlerts().set('test_dev', true);

      alertService.resolveAlert('test_dev');

      expect(alertService._getActiveAlerts().get('test_dev')).toBe(false);
    });
  });
});
