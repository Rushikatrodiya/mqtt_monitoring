import LiveClock from './LiveClock';

export default function DashboardHeader({ onlineCount, totalCount }) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-fg">L1 monitoring tool</h1>
        <p className="text-muted text-sm mt-1">
          Live telemetry from every connected sensor node.
        </p>
      </div>
      <div className="flex gap-8 items-start text-right">
        <div>
          <LiveClock />
          <div className="text-xs text-muted mt-1">Local time</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-online">{onlineCount}</div>
          <div className="text-xs text-muted mt-1">Online</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-fg">{totalCount}</div>
          <div className="text-xs text-muted mt-1">Nodes</div>
        </div>
      </div>
    </div>
  );
}
