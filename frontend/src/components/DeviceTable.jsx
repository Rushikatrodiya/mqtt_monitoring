import DeviceRow from './DeviceRow';

export default function DeviceTable({ sortedDevices }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden mt-6">
      {/* Header */}
      <div className="grid grid-cols-[80px_1fr_220px_120px] px-6 py-3 border-b border-border text-xs text-muted uppercase tracking-widest font-semibold">
        <span>Freshness</span>
        <span>Device</span>
        <span>Last Seen</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      {!sortedDevices || sortedDevices.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">
          No devices connected yet.
        </div>
      ) : (
        sortedDevices.map((device, i) => (
          <DeviceRow
            key={device.deviceId}
            device={device}
            isLastRow={i === sortedDevices.length - 1}
          />
        ))
      )}
    </div>
  );
}
