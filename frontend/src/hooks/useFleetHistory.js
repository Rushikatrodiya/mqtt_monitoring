import { useQueryData } from './useQueryData';
import { fetchHistory } from '../api/deviceApi';

export function useFleetHistory() {
  const chartData = useQueryData(['history'], fetchHistory, {
    refetchInterval: 5000,
    transform: (history) =>
      (history ?? []).map(h => ({
        time: new Date(h.time).toLocaleTimeString('en-US', { hour12: false }),
        online: h.online,
      })),
  });

  return { chartData };
}
