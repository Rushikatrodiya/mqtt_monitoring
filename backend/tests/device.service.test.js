const deviceService = require('../src/features/device-monitoring/device.service');
const deviceStore = require('../src/features/device-monitoring/device.store');
const devicesConfig = require('../src/config/devices.config');

jest.mock('../src/features/device-monitoring/device.store');
jest.mock('../src/config/devices.config', () => [
  { deviceId: 'test_sensor_1', expectedIntervalMs: 5000 },
  { deviceId: 'test_sensor_2', expectedIntervalMs: 10000 }
]);
jest.mock('../src/shared/logger');

describe('DeviceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerMessage', () => {
    it('should ignore unconfigured devices', () => {
      deviceService.registerMessage('unknown_sensor');
      expect(deviceStore.upsertLastSeen).not.toHaveBeenCalled();
    });

    it('should update lastSeen and status to ONLINE for configured devices', () => {
      deviceService.registerMessage('test_sensor_1');
      expect(deviceStore.upsertLastSeen).toHaveBeenCalledWith('test_sensor_1', expect.any(String));
      expect(deviceStore.setStatus).toHaveBeenCalledWith('test_sensor_1', 'ONLINE');
    });
  });

  describe('getAllStatuses', () => {
    it('should return active devices and un-seen configured devices', () => {
      deviceStore.getAll.mockReturnValue([
        { deviceId: 'test_sensor_1', status: 'ONLINE', lastSeenAt: '2023-01-01T00:00:00.000Z' }
      ]);

      const result = deviceService.getAllStatuses();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        deviceId: 'test_sensor_1',
        status: 'ONLINE',
        lastSeenAt: '2023-01-01T00:00:00.000Z',
        expectedIntervalMs: 5000
      });
      expect(result[1]).toEqual({
        deviceId: 'test_sensor_2',
        status: 'UNKNOWN',
        lastSeenAt: null,
        expectedIntervalMs: 10000
      });
    });
  });
});
