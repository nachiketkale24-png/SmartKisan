
import React, { useState, useEffect } from 'react';
import { useIoT } from '../context/AppContext';

// ============================================
// IOT DEVICE SYNC BANNER
// Small banner showing ESP32 connection status
// ============================================
const DeviceSyncBanner: React.FC = () => {
  const { deviceStatus, sensorData } = useIoT();
  const [showDetails, setShowDetails] = useState(false);

  // Auto-hide details after showing
  useEffect(() => {
    if (showDetails) {
      const timer = setTimeout(() => setShowDetails(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showDetails]);

  const getStatusConfig = () => {
    switch (deviceStatus) {
      case 'connected':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'sensors',
          iconBg: 'bg-green-500',
          text: 'ESP32 Connected',
          subtext: 'Receiving sensor data',
          pulse: true
        };
      case 'searching':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'search',
          iconBg: 'bg-amber-500',
          text: 'Searching for device...',
          subtext: 'Looking for ESP32',
          pulse: true
        };
      case 'disconnected':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'sensors_off',
          iconBg: 'bg-red-500',
          text: 'Device Disconnected',
          subtext: 'Check ESP32 connection',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      onClick={() => setShowDetails(!showDetails)}
      className={`rounded-xl ${config.bg} border ${config.border} p-3 cursor-pointer active:scale-[0.99] transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-lg ${config.iconBg} flex items-center justify-center relative`}>
            <span className="material-symbols-outlined text-white text-[20px]">{config.icon}</span>
            {config.pulse && (
              <span className="absolute -top-0.5 -right-0.5 size-3 bg-green-400 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold">{config.text}</p>
            <p className="text-xs text-gray-500">{config.subtext}</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-gray-400">
          {showDetails ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {/* Expanded Details */}
      {showDetails && sensorData && deviceStatus === 'connected' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Live Sensor Data:</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="material-symbols-outlined text-blue-500 text-[20px]">water_drop</span>
              <p className="text-lg font-bold">{sensorData.soilMoisture}%</p>
              <p className="text-[10px] text-gray-500">Moisture</p>
            </div>
            <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="material-symbols-outlined text-orange-500 text-[20px]">thermostat</span>
              <p className="text-lg font-bold">{sensorData.temperature}°C</p>
              <p className="text-[10px] text-gray-500">Temp</p>
            </div>
            <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="material-symbols-outlined text-cyan-500 text-[20px]">humidity_percentage</span>
              <p className="text-lg font-bold">{sensorData.humidity}%</p>
              <p className="text-[10px] text-gray-500">Humidity</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceSyncBanner;
