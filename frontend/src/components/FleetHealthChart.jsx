import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function FleetHealthChart({ chartData, totalCount }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-8">
      <div className="flex justify-between mb-4">
        <span className="font-bold text-green">Fleet health</span>
        <span className="text-xs text-muted">online nodes, live</span>
      </div>
      {chartData.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-muted text-xs">
          Collecting data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
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
  );
}
