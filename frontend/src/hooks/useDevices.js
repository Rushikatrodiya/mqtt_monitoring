import { useQueryData } from './useQueryData';
import { fetchDevices } from '../api/deviceApi';

export function useDevices() {
  return useQueryData(['devices'], fetchDevices, {
    // Poll at the fastest device's expected interval so we never miss a status change
    refetchInterval: (query) => {
      const devices = query.state.data;
      if (!devices || devices.length === 0) return 5000;
      const intervals = devices.map(d => d.expectedIntervalMs).filter(Boolean);
      return Math.min(...intervals);
    },
    transform: (devices) => {
      const sortedDevices = [...(devices ?? [])].sort((a, b) =>
        a.deviceId.localeCompare(b.deviceId)
      );
      const onlineCount = sortedDevices.filter(d => d.status === 'ONLINE').length;
      return { devices, sortedDevices, onlineCount, totalCount: sortedDevices.length };
    },
  });
}
