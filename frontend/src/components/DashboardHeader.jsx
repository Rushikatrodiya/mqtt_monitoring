import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LiveClock from './LiveClock';
import { resetDemo } from '../api/deviceApi';

export default function DashboardHeader({ onlineCount, totalCount }) {
  const [isResetting, setIsResetting] = useState(false);
  const queryClient = useQueryClient();

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetDemo();
      // Invalidate both so chart and device table refresh instantly
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    } catch (err) {
      console.error('Reset failed', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-fg">L1 monitoring tool</h1>
        <p className="text-muted text-sm mt-1">
          Live telemetry from every connected sensor node.
        </p>
      </div>
      <div className="flex gap-8 items-start text-right">
        {/* Its clear history and basically restart server */}
        <div className="pt-2 text-right">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-fg hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResetting ? 'Resetting...' : 'Restart'}
          </button>
          <div className="text-xs text-muted mt-1">⚠ For testing only</div>
        </div>
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
