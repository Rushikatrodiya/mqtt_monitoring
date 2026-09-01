import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const DeviceCard = ({ id, status, lastSeen }) => {
  const isOnline = status === 'ONLINE';
  
  // Format last seen timestamp
  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 ${
      isOnline 
        ? 'border-success/30 bg-dark-card shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
        : 'border-alert/50 bg-alert/5 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
    }`}>
      
      {/* Top Gradient Bar */}
      <div className={`h-1 w-full ${isOnline ? 'bg-success' : 'bg-alert animate-pulse'}`} />

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isOnline ? 'bg-success/10 text-success' : 'bg-alert/10 text-alert'}`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">{id}</h3>
              <p className="text-sm text-slate-400">Sensor Node</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isOnline ? 'bg-success/10 text-success' : 'bg-alert/10 text-alert border border-alert/20'
          }`}>
            {isOnline ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Online</>
            ) : (
              <><AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Offline</>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Last active: <strong className="text-slate-300 font-medium">{formatTime(lastSeen)}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
