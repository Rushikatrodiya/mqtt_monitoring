const watchdogService = require('../src/features/alerting/watchdog.service');
const deviceService = require('../src/features/device-monitoring/device.service');
const deviceStore = require('../src/features/device-monitoring/device.store');
const alertService = require('../src/features/alerting/alert.service');

jest.mock('../src/features/device-monitoring/device.service');
jest.mock('../src/features/device-monitoring/device.store');
jest.mock('../src/features/alerting/alert.service');
jest.mock('../src/shared/logger');

describe('WatchdogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('scan', () => {
    it('should trigger alert for devices that have not been seen', () => {
      deviceService.getAllStatuses.mockReturnValue([
        { deviceId: 'sensor_1', status: 'UNKNOWN', lastSeenAt: null, expectedIntervalMs: 5000 }
      ]);

      watchdogService.scan();

      expect(deviceStore.setStatus).toHaveBeenCalledWith('sensor_1', 'OFFLINE');
      expect(alertService.handleSilence).toHaveBeenCalled();
    });

    it('should trigger alert for devices that exceeded their interval', () => {
      const now = new Date('2023-01-01T00:00:10.000Z');
      jest.setSystemTime(now);

      deviceService.getAllStatuses.mockReturnValue([
        { 
          deviceId: 'sensor_2', 
          status: 'ONLINE', 
          lastSeenAt: '2023-01-01T00:00:00.000Z', // 10 seconds ago
          expectedIntervalMs: 5000 // expected every 5s
        }
      ]);

      watchdogService.scan();

      expect(deviceStore.setStatus).toHaveBeenCalledWith('sensor_2', 'OFFLINE');
      expect(alertService.handleSilence).toHaveBeenCalled();
    });

    it('should resolve alert and set status ONLINE for healthy devices', () => {
      const now = new Date('2023-01-01T00:00:03.000Z');
      jest.setSystemTime(now);

      deviceService.getAllStatuses.mockReturnValue([
        { 
          deviceId: 'sensor_3', 
          status: 'OFFLINE', // previously offline
          lastSeenAt: '2023-01-01T00:00:00.000Z', // 3 seconds ago
          expectedIntervalMs: 5000 
        }
      ]);

      watchdogService.scan();

      expect(deviceStore.setStatus).toHaveBeenCalledWith('sensor_3', 'ONLINE');
      expect(alertService.resolveAlert).toHaveBeenCalledWith('sensor_3');
    });
  });
});
