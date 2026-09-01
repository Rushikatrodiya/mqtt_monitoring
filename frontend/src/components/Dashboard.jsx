import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { fetchDevices, fetchHistory } from '../api/deviceApi';
import FreshnessRing from './FreshnessRing';

// Format ISO timestamp to "HH:MM:SS AM/PM"
function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

// Format time-ago string (e.g. "6s ago")
function timeAgo(iso) {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// Live clock component
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, letterSpacing: 2 }}>
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}

const Dashboard = () => {
  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: fetchDevices,
    refetchInterval: 3000,
  });

  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
    refetchInterval: 5000,
  });

  const totalCount = devices?.length ?? 0;
  const onlineCount = devices?.filter(d => d.status === 'ONLINE').length ?? 0;

  // Always sort by deviceId so order is consistent (sensor_001, sensor_002, sensor_003...)
  const sortedDevices = [...(devices ?? [])].sort((a, b) =>
    a.deviceId.localeCompare(b.deviceId)
  );

  // Format history for recharts
  const chartData = (history ?? []).map(h => ({
    time: new Date(h.time).toLocaleTimeString('en-US', { hour12: false }),
    online: h.online,
  }));

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: -1 }}>Fleet Pulse</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Live telemetry from every connected sensor node.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', textAlign: 'right' }}>
          <div>
            <LiveClock />
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 2 }}>Local time</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-green)' }}>{onlineCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>Online</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>Nodes</div>
          </div>
        </div>
      </div>

      {/* ── Broker status ── */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', display: 'inline-block' }} />
        connected to broker at mqtt://localhost:1883
      </div>

      {/* ── Fleet Health Graph ── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-green)' }}>Fleet health</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>online nodes, live</span>
        </div>
        {chartData.length === 0 ? (
          <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
            Collecting data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3fb950" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#7d8590' }} domain={[0, totalCount || 5]} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: '#7d8590' }}
                itemStyle={{ color: '#3fb950' }}
              />
              <Area
                type="monotone"
                dataKey="online"
                stroke="#3fb950"
                strokeWidth={2}
                fill="url(#healthGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Device Table ── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '64px 1fr 180px 100px',
          padding: '0.6rem 1rem',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.72rem',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          <span>Freshness</span>
          <span>Device</span>
          <span>Last seen</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        {!sortedDevices || sortedDevices.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            No devices connected yet.
          </div>
        ) : (
          sortedDevices.map((device, i) => {
            const isOnline = device.status === 'ONLINE';
            const borderColor = isOnline ? 'var(--color-green)' : 'var(--color-red)';
            return (
              <div
                key={device.deviceId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr 180px 100px',
                  padding: '0.85rem 1rem',
                  alignItems: 'center',
                  borderBottom: i < sortedDevices.length - 1 ? '1px solid var(--color-border)' : 'none',
                  borderLeft: `3px solid ${borderColor}`,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Freshness Ring */}
                <FreshnessRing
                  lastSeenAt={device.lastSeenAt}
                  expectedIntervalMs={device.expectedIntervalMs}
                  status={device.status}
                />

                {/* Device Info */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: 0.5 }}>{device.deviceId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 2 }}>{device.type}</div>
                </div>

                {/* Last Seen */}
                <div>
                  <div style={{ fontSize: '0.85rem' }}>{formatTime(device.lastSeenAt)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 2 }}>{timeAgo(device.lastSeenAt)}</div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: isOnline ? 'var(--color-green)' : 'var(--color-red)',
                    boxShadow: isOnline ? '0 0 6px #3fb950' : '0 0 6px #f85149',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 600,
                    color: isOnline ? 'var(--color-green)' : 'var(--color-red)'
                  }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--color-muted)', textAlign: 'center' }}>
        Refreshes automatically every 3 seconds.
      </div>
    </div>
  );
};

export default Dashboard;
