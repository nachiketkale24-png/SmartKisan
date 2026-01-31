
import React from 'react';
import { Screen, DEMO_DATA, Alert } from '../types';
import SpeakButton from '../components/SpeakButton';

interface Props {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

// Alert Card Component with Voice Playback
const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  const getAlertConfig = (type: Alert['type']) => {
    switch (type) {
      case 'over':
        return {
          icon: 'water_damage',
          title: 'Over Irrigation Alert',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600',
          speakPrefix: 'Over irrigation alert:'
        };
      case 'under':
        return {
          icon: 'water_drop',
          title: 'Under Irrigation Alert',
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          iconColor: 'text-orange-600',
          speakPrefix: 'Under irrigation alert:'
        };
      case 'weather':
        return {
          icon: 'cloud',
          title: 'Weather Cancel Alert',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600',
          speakPrefix: 'Weather alert:'
        };
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return { label: 'HIGH', bg: 'bg-red-500', text: 'text-white' };
      case 'medium':
        return { label: 'MEDIUM', bg: 'bg-orange-500', text: 'text-white' };
      case 'low':
        return { label: 'LOW', bg: 'bg-green-500', text: 'text-white' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const config = getAlertConfig(alert.type);
  const severity = getSeverityBadge(alert.severity);
  const speakText = `${config.speakPrefix} ${alert.message}. Priority: ${alert.severity}.`;

  return (
    <div className="bg-white dark:bg-[#1a2e1a] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`size-12 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
          <span className={`material-symbols-outlined text-[28px] ${config.iconColor}`}>{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold truncate">{config.title}</h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${severity.bg} ${severity.text}`}>
                {severity.label}
              </span>
              <SpeakButton text={speakText} size="sm" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{alert.message}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>{formatTimestamp(alert.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertsScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
  const alerts = DEMO_DATA.alerts;

  const highAlerts = alerts.filter(a => a.severity === 'high');
  const otherAlerts = alerts.filter(a => a.severity !== 'high');

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-background-dark shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold flex-1 text-center pr-12">Alerts</h2>
      </header>

      {/* Alert Summary */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-red-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[24px]">notifications_active</span>
            </div>
            <div>
              <p className="text-sm font-bold">{alerts.length} Active Alerts</p>
              <p className="text-xs text-gray-500">{highAlerts.length} require immediate attention</p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all">
            Clear All
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {/* Critical Alerts Section */}
        {highAlerts.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-red-500 text-[20px]">priority_high</span>
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Critical</h3>
            </div>
            {highAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </>
        )}

        {/* Other Alerts Section */}
        {otherAlerts.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-1 mt-4">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">notifications</span>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Other Alerts</h3>
            </div>
            {otherAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </>
        )}

        {/* Empty State */}
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-green-500 text-[48px]">check_circle</span>
            </div>
            <h3 className="text-lg font-bold mb-2">All Clear!</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">No active alerts. Your irrigation system is running smoothly.</p>
          </div>
        )}
      </main>

      {/* Quick Action Button */}
      <div className="absolute bottom-0 w-full p-4 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => onNavigate(Screen.OFFLINE_INPUT)}
          className="w-full bg-primary hover:bg-green-400 text-black h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">edit_note</span>
          Manual Check
        </button>
      </div>
    </div>
  );
};

export default AlertsScreen;
