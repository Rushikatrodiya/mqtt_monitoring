import FreshnessRing from './FreshnessRing';
import { formatTime, timeAgo } from '../utils/formatters';

export default function DeviceRow({ device, isLastRow }) {
  const isOnline = device.status === 'ONLINE';

  return (
    <div
      className={`
        grid grid-cols-[80px_1fr_220px_120px]
        px-6 py-5
        items-center
        border-l-4
        transition-colors
        hover:bg-hover
        ${isOnline ? 'border-l-online' : 'border-l-offline'}
        ${!isLastRow ? 'border-b border-border' : ''}
      `}
    >
      {/* Freshness Ring */}
      <FreshnessRing
        lastSeenAt={device.lastSeenAt}
        expectedIntervalMs={device.expectedIntervalMs}
        status={device.status}
      />

      {/* Device Name + Type */}
      <div>
        <div className="font-bold text-base text-fg tracking-tight">{device.deviceId}</div>
        <div className="text-sm text-muted mt-1">{device.type}</div>
      </div>

      {/* Last Seen */}
      <div>
        <div className="text-sm text-fg">{formatTime(device.lastSeenAt)}</div>
        <div className="text-sm text-muted mt-1">{timeAgo(device.lastSeenAt)}</div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={`
          w-2.5 h-2.5 rounded-full flex-shrink-0
          ${isOnline
            ? 'bg-online shadow-[0_0_7px_#3fb950]'
            : 'bg-offline shadow-[0_0_7px_#f85149]'
          }
        `} />
        <span className={`text-sm font-semibold ${isOnline ? 'text-online' : 'text-offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
