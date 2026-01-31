
import React, { useState } from 'react';
import { Screen, DEMO_DATA } from '../types';
import SpeakButton from '../components/SpeakButton';
import SystemStatusPanel from '../components/SystemStatusPanel';
import DeviceSyncBanner from '../components/DeviceSyncBanner';
import FertilizerPanel from '../components/FertilizerPanel';

interface Props {
  onNavigate: (screen: Screen) => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
}

// Reusable Card Component
const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`rounded-2xl bg-white dark:bg-[#1a2e1a] shadow-sm border border-gray-100 dark:border-gray-800 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

// Status Badge Component
const StatusBadge: React.FC<{ icon: string; label: string; active: boolean; color: string }> = ({ icon, label, active, color }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${active ? color : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
    <span className="material-symbols-outlined text-[14px]">{icon}</span>
    <span className="hidden xs:inline">{label}</span>
  </div>
);

const Dashboard: React.FC<Props> = ({ onNavigate, toggleDarkMode, darkMode }) => {
  // Demo state management
  const [demoData] = useState(DEMO_DATA);
  const [offlineMode, setOfflineMode] = useState(demoData.isOfflineMode);
  const [lowPowerMode] = useState(demoData.isLowPowerMode);

  // Get status colors based on soil moisture
  const getMoistureStatus = (moisture: number) => {
    if (moisture >= 30 && moisture <= 60) return { status: 'Optimal', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/30' };
    if (moisture < 30 || moisture > 80) return { status: 'Misuse Detected', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/30' };
    return { status: 'Warning', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/30' };
  };

  const getIrrigationLabel = (status: 'normal' | 'over' | 'under') => {
    switch (status) {
      case 'over': return { label: 'Over Irrigation', icon: 'water_damage', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' };
      case 'under': return { label: 'Under Irrigation', icon: 'water_drop', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' };
      default: return { label: 'Normal', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' };
    }
  };

  const moistureStatus = getMoistureStatus(demoData.soilMoisture);
  const irrigationInfo = getIrrigationLabel(demoData.irrigationStatus);
  const waterSavingPercent = Math.round((demoData.waterSavedToday / demoData.waterSavingGoal) * 100);

  // Text for TTS
  const irrigationSpeakText = `Irrigation Status: ${irrigationInfo.label}. Soil moisture ${demoData.soilMoisture} percent hai.`;
  const recommendationSpeakText = `${demoData.recommendation.action}. Reason: ${demoData.recommendation.reason}`;

  return (
    <div className="flex flex-col h-screen overflow-y-auto pb-24">
      {/* Status Badges Top Bar */}
      <div className="bg-gray-50 dark:bg-gray-900/50 w-full px-3 py-2 flex items-center justify-center gap-2 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
        <StatusBadge 
          icon="cloud_off" 
          label="Offline" 
          active={offlineMode} 
          color="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
        />
        <StatusBadge 
          icon="battery_saver" 
          label="Low Power" 
          active={lowPowerMode} 
          color="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
        />
        <StatusBadge 
          icon="sync" 
          label={`${demoData.pendingSyncs} Pending`}
          active={demoData.pendingSyncs > 0} 
          color="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
        />
        {/* Demo Toggle */}
        <button 
          onClick={() => setOfflineMode(!offlineMode)}
          className="ml-auto text-[10px] px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium"
        >
          Demo
        </button>
      </div>

      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark/95 backdrop-blur-sm sticky top-[40px] z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full border-2 border-primary bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=1")' }}></div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Namaste,</span>
            <h1 className="text-base font-bold leading-tight">Ramesh Kumar</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleDarkMode} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5">
            <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={() => onNavigate(Screen.ALERTS)} className="size-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-4 p-4">
        {/* IoT Device Sync Banner */}
        <DeviceSyncBanner />

        {/* STEP 1: Soil Moisture Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-[28px]">water_drop</span>
              <h3 className="text-base font-bold">Soil Moisture</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${moistureStatus.bgColor} ${moistureStatus.textColor}`}>
                <div className={`size-2.5 rounded-full ${moistureStatus.color}`}></div>
                {moistureStatus.status}
              </div>
              <SpeakButton text={`Soil moisture ${demoData.soilMoisture} percent hai. Status: ${moistureStatus.status}`} size="sm" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-5xl font-bold ${moistureStatus.textColor}`}>{demoData.soilMoisture}</span>
            <span className="text-2xl text-gray-400 mb-1">%</span>
          </div>
          <div className="mt-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${moistureStatus.color} transition-all duration-500`}
              style={{ width: `${demoData.soilMoisture}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
            <span>0%</span>
            <span className="text-green-500">Optimal 30-60%</span>
            <span>100%</span>
          </div>
        </Card>

        {/* STEP 1: Irrigation Status Card with Recommendation */}
        <Card className="p-5" onClick={() => onNavigate(Screen.IRRIGATION)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`size-14 rounded-2xl ${irrigationInfo.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[32px] ${irrigationInfo.color}`}>{irrigationInfo.icon}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Irrigation Status</p>
                <p className={`text-xl font-bold ${irrigationInfo.color}`}>{irrigationInfo.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {demoData.irrigationStatus !== 'normal' && (
                <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-red-500">warning</span>
                </div>
              )}
              <SpeakButton text={irrigationSpeakText} size="md" />
            </div>
          </div>
          
          {/* Inline Recommendation */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">lightbulb</span>
              <span className="text-sm font-bold text-green-800 dark:text-green-200">{demoData.recommendation.action}</span>
            </div>
          </div>
        </Card>

        {/* STEP 1: Water Saving Card */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-600 text-[24px]">savings</span>
              <h3 className="text-base font-bold text-cyan-800 dark:text-cyan-200">Water Saved Today</h3>
            </div>
            <SpeakButton text={`Aaj ${demoData.waterSavedToday} liter paani bacha. Daily goal ka ${waterSavingPercent} percent complete.`} size="sm" />
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-cyan-700 dark:text-cyan-300">{demoData.waterSavedToday}</span>
            <span className="text-lg text-cyan-500 mb-1">Liters</span>
          </div>
          <div className="h-4 bg-white/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(waterSavingPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-medium">{waterSavingPercent}% of daily goal ({demoData.waterSavingGoal}L)</p>
        </Card>

        {/* AI Recommendation Panel with TTS */}
        <Card className="p-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">psychology</span>
              <h3 className="text-base font-bold">AI Recommendation</h3>
            </div>
            <SpeakButton text={recommendationSpeakText} size="md" />
          </div>
          <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4 mb-3">
            <p className="text-lg font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
              <span className="material-symbols-outlined">lightbulb</span>
              {demoData.recommendation.action}
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
            <p><span className="font-semibold">Reason:</span> {demoData.recommendation.reason}</p>
          </div>
        </Card>

        {/* Fertilizer Recommendation Panel */}
        <FertilizerPanel />

        {/* System Status Panel */}
        <SystemStatusPanel />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate(Screen.OFFLINE_INPUT)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-[#1a2e1a] shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition-all"
          >
            <div className="size-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-[28px]">edit_note</span>
            </div>
            <span className="text-sm font-bold">Manual Input</span>
            <span className="text-[10px] text-gray-500">Offline Fallback</span>
          </button>

          <button 
            onClick={() => onNavigate(Screen.VOICE_ASSISTANT)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-sm border border-green-200 dark:border-green-800 active:scale-95 transition-all"
          >
            <div className="size-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">mic</span>
            </div>
            <span className="text-sm font-bold">Voice Assistant</span>
            <span className="text-[10px] text-green-600">AI Sahayak</span>
          </button>
        </div>

        <button 
          onClick={() => onNavigate(Screen.ALERTS)}
          className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white shadow-lg active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px]">notifications_active</span>
            <div className="text-left">
              <span className="text-lg font-bold">View Alerts</span>
              <p className="text-xs opacity-90">{demoData.alerts.length} active alerts</p>
            </div>
          </div>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </main>

      <nav className="fixed bottom-0 left-0 w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark pb-6 pt-2 z-30">
        <div className="flex justify-around items-center px-2 h-16">
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined filled">home</span>
            <span className="text-[11px] font-bold">Home</span>
          </button>
          <button onClick={() => onNavigate(Screen.VOICE_ASSISTANT)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">mic</span>
            <span className="text-[11px] font-medium">Voice</span>
          </button>
          <button onClick={() => onNavigate(Screen.SYNC)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">sync</span>
            <span className="text-[11px] font-medium">Sync</span>
          </button>
          <button onClick={() => onNavigate(Screen.ALERTS)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-[11px] font-medium">Alerts</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
