
import React from 'react';
import { useOffline, useIoT } from '../context/AppContext';

// ============================================
// SYSTEM STATUS PANEL
// Shows IoT device status, offline mode, sensor health
// ============================================
const SystemStatusPanel: React.FC = () => {
  const { isOffline, lastSyncTime, cachedWeatherActive, offlineDecisionEngineRunning } = useOffline();
  const { deviceStatus, sensorData, lastDataReceived } = useIoT();

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDeviceStatusConfig = () => {
    switch (deviceStatus) {
      case 'connected':
        return { label: 'ESP32 Connected', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: 'sensors', pulse: false };
      case 'searching':
        return { label: 'Searching...', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'search', pulse: true };
      case 'disconnected':
        return { label: 'Disconnected', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: 'sensors_off', pulse: false };
    }
  };

  const deviceConfig = getDeviceStatusConfig();

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a2e1a] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">monitoring</span>
            <h3 className="text-sm font-bold">System Status</h3>
          </div>
          <span className="text-[10px] text-gray-500">Auto-refresh</span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="p-4 space-y-3">
        {/* IoT Device Status */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-lg ${deviceConfig.bg} flex items-center justify-center ${deviceConfig.pulse ? 'animate-pulse' : ''}`}>
              <span className={`material-symbols-outlined ${deviceConfig.color}`}>{deviceConfig.icon}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">IoT Device</p>
              <p className={`text-sm font-bold ${deviceConfig.color}`}>{deviceConfig.label}</p>
            </div>
          </div>
          {deviceStatus === 'connected' && (
            <div className="size-3 rounded-full bg-green-500 animate-pulse"></div>
          )}
        </div>

        {/* Offline Mode Status */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-lg ${isOffline ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${isOffline ? 'text-amber-600' : 'text-green-600'}`}>
                {isOffline ? 'cloud_off' : 'cloud_done'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Network Mode</p>
              <p className={`text-sm font-bold ${isOffline ? 'text-amber-600' : 'text-green-600'}`}>
                {isOffline ? 'Offline Mode' : 'Online'}
              </p>
            </div>
          </div>
        </div>

        {/* Sensor Status */}
        {sensorData && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">sensors</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sensor Status</p>
                <p className="text-sm font-bold text-blue-600">Receiving Data</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Last: {formatTime(lastDataReceived)}</p>
            </div>
          </div>
        )}

        {/* Last Sync Time */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">sync</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Sync</p>
              <p className="text-sm font-bold text-purple-600">{formatTime(lastSyncTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Indicators */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {cachedWeatherActive && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-[10px] font-semibold">
            <span className="material-symbols-outlined text-[12px]">cached</span>
            Cached Weather
          </span>
        )}
        {offlineDecisionEngineRunning && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-semibold">
            <span className="material-symbols-outlined text-[12px]">psychology</span>
            Offline AI Active
          </span>
        )}
      </div>
    </div>
  );
};

export default SystemStatusPanel;
