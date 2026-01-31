import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { useOffline } from '../contexts/OfflineContext';
import { useAI } from '../contexts/AIContext';
import { AgriGuardAI } from '../ai_engine';
import SpeakButton from '../components/SpeakButton';
import VoiceButton from '../components/VoiceButton';

interface Props {
  onNavigate: (screen: Screen) => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
}

// Demo mock data
const DEMO_DATA = {
  farmer: { name: 'Ramesh Kumar', village: 'Sonipat', plots: 3 },
  sensors: { moisture: 68, temperature: 28, humidity: 65 },
  weather: { condition: 'Sunny', forecast: 'Clear for 3 days' },
  waterSaved: { today: 250, target: 400, weekly: 1500 },
  alerts: { active: 3, high: 1, medium: 1, low: 1 },
};

const Dashboard: React.FC<Props> = ({ onNavigate, toggleDarkMode, darkMode }) => {
  const { 
    isOnline, isIoTConnected, lastSyncTime, sensorStatus, cachedWeatherActive, 
    offlineEngineRunning, deviceSearching, isDemoMode, isOfflineSimulation,
    batteryLevel, signalStrength, pendingSyncCount, toggleOfflineSimulation
  } = useOffline();
  const { isListening, lastResponse } = useAI();

  // Get REAL data from AI Engine
  const sensorData = AgriGuardAI.getSensorData();
  const weatherData = AgriGuardAI.getWeatherData();
  const cropData = AgriGuardAI.getCropData();

  // Local state for UI controls
  const [soilMoisture, setSoilMoisture] = useState(sensorData.soilMoisture);
  const [temperature, setTemperature] = useState(sensorData.temperature);
  const [waterSavedToday] = useState(250);
  const [waterSavingTarget] = useState(400);
  const [selectedCrop, setSelectedCrop] = useState(cropData.type);
  const [selectedStage, setSelectedStage] = useState(cropData.stage);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  // Sync local state changes to AI Engine
  useEffect(() => {
    AgriGuardAI.updateSensorData({ soilMoisture, temperature });
  }, [soilMoisture, temperature]);

  useEffect(() => {
    AgriGuardAI.updateCropData({ type: selectedCrop as any, stage: selectedStage as any });
  }, [selectedCrop, selectedStage]);

  // Status badges state
  const isOfflineMode = isOfflineSimulation || !isOnline;
  const isLowPowerMode = batteryLevel < 50;

  // Get REAL recommendations from AI Engine
  const irrigationRec = AgriGuardAI.getIrrigationAdvice();
  const fertilizerRec = AgriGuardAI.getFertilizerAdvice();

  // Moisture status with clear visual indicators
  const getMoistureStatus = (value: number) => {
    if (value < 20 || value > 85) return { 
      label: 'Misuse', 
      color: 'bg-red-500', 
      textColor: 'text-red-600',
      icon: 'warning',
      description: 'Immediate action needed'
    };
    if (value < 40 || value > 70) return { 
      label: 'Warning', 
      color: 'bg-orange-500', 
      textColor: 'text-orange-600',
      icon: 'error_outline',
      description: 'Monitor closely'
    };
    return { 
      label: 'Optimal', 
      color: 'bg-green-500', 
      textColor: 'text-green-600',
      icon: 'check_circle',
      description: 'Good condition'
    };
  };

  // Irrigation status helper
  const getIrrigationStatus = () => {
    if (soilMoisture > 80) return { label: 'Over Irrigation', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-500', icon: 'water_damage' };
    if (soilMoisture < 40) return { label: 'Under Irrigation', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-500', icon: 'water_drop' };
    return { label: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-500', icon: 'water' };
  };

  // Signal strength bars
  const renderSignalBars = () => (
    <div className="flex gap-0.5 items-end h-3">
      {[1, 2, 3, 4].map(bar => (
        <div 
          key={bar} 
          className={`w-1 rounded-sm ${bar <= signalStrength ? 'bg-green-500' : 'bg-gray-300'}`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );

  const moistureStatus = getMoistureStatus(soilMoisture);
  const irrigationStatus = getIrrigationStatus();
  const waterSavingPercent = Math.round((waterSavedToday / waterSavingTarget) * 100);

  return (
    <div className="flex flex-col h-screen overflow-y-auto pb-24 scroll-smooth">
      {/* Demo Mode Panel - Collapsible */}
      {isDemoMode && (
        <div className="bg-purple-900 text-white">
          <button 
            onClick={() => setShowDemoPanel(!showDemoPanel)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">science</span>
              DEMO MODE
            </span>
            <span className="material-symbols-outlined text-[16px]">
              {showDemoPanel ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showDemoPanel && (
            <div className="px-3 pb-3 space-y-2">
              {/* Offline Toggle */}
              <div className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                <span className="text-xs">Offline Simulation</span>
                <button 
                  onClick={toggleOfflineSimulation}
                  className={`w-12 h-6 rounded-full transition-all ${isOfflineSimulation ? 'bg-amber-500' : 'bg-gray-500'}`}
                >
                  <div className={`size-5 bg-white rounded-full shadow transition-transform ${isOfflineSimulation ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {/* Moisture Slider */}
              <div className="bg-white/10 rounded-lg p-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Soil Moisture</span>
                  <span className="font-bold">{soilMoisture}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-white/20 accent-primary"
                />
              </div>
              {/* Temperature Slider */}
              <div className="bg-white/10 rounded-lg p-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Temperature</span>
                  <span className="font-bold">{temperature}°C</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-white/20 accent-orange-500"
                />
              </div>
              {/* Randomize Button */}
              <button 
                onClick={() => {
                  const data = AgriGuardAI.randomizeSensorData();
                  setSoilMoisture(data.soilMoisture);
                  setTemperature(data.temperature);
                }}
                className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">shuffle</span>
                Randomize Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Badges - Top Bar (Mobile Optimized) */}
      <div className="bg-gradient-to-r from-green-800 to-blue-800 text-white w-full px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between sticky top-0 z-20 safe-area-top">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {isOfflineMode && (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-amber-500/30 text-[10px] sm:text-xs font-semibold">
              <span className="material-symbols-outlined text-[10px] sm:text-[12px]">cloud_off</span>
              Offline
            </span>
          )}
          {isLowPowerMode && (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-orange-500/30 text-[10px] sm:text-xs font-semibold">
              <span className="material-symbols-outlined text-[10px] sm:text-[12px]">battery_2_bar</span>
              {batteryLevel}%
            </span>
          )}
          {pendingSyncCount > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-blue-500/30 text-[10px] sm:text-xs font-semibold">
              <span className="material-symbols-outlined text-[10px] sm:text-[12px]">sync</span>
              {pendingSyncCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {renderSignalBars()}
        </div>
      </div>

      {/* Header - Mobile Optimized */}
      <header className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark/95 backdrop-blur-sm sticky top-[32px] sm:top-[40px] z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="size-10 sm:size-12 rounded-full border-2 border-primary bg-cover bg-center shrink-0" style={{ backgroundImage: 'url("https://picsum.photos/100/100?random=1")' }}></div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Namaste,</span>
            <h1 className="text-lg sm:text-xl font-bold leading-tight truncate">{DEMO_DATA.farmer.name}</h1>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
          <button onClick={toggleDarkMode} className="size-10 sm:size-12 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-xl sm:text-2xl">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={() => onNavigate(Screen.ALERTS)} className="size-10 sm:size-12 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 relative active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-xl sm:text-2xl">notifications</span>
            {DEMO_DATA.alerts.active > 0 && (
              <span className="absolute top-1 sm:top-2 right-1 sm:right-2 size-4 sm:size-5 bg-red-500 rounded-full border-2 border-white text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center">
                {DEMO_DATA.alerts.active}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Device Sync Banner - Compact Mobile */}
        <div className={`rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 ${isIoTConnected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <div className={`size-2.5 sm:size-3 rounded-full shrink-0 ${deviceSearching ? 'bg-yellow-500 animate-pulse' : isIoTConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs sm:text-sm font-medium flex-1 truncate">
            {deviceSearching ? 'Searching...' : isIoTConnected ? 'ESP32 Connected' : 'Device Disconnected'}
          </span>
          {isIoTConnected && <span className="material-symbols-outlined text-green-600 text-base sm:text-lg animate-spin shrink-0" style={{ animationDuration: '3s' }}>sync</span>}
        </div>

        {/* ========== SOIL MOISTURE CARD - Mobile Optimized ========== */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a2e1a] shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
              <span className="material-symbols-outlined text-blue-500 text-xl sm:text-2xl">water_drop</span>
              Soil Moisture
            </h3>
            <span className={`${moistureStatus.color} text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex items-center gap-0.5 sm:gap-1`}>
              <span className="material-symbols-outlined text-[12px] sm:text-[14px]">{moistureStatus.icon}</span>
              {moistureStatus.label}
            </span>
          </div>
          
          {/* Large Percentage Display */}
          <div className="relative z-10 flex items-end gap-1 sm:gap-2 mb-1 sm:mb-2">
            <span className={`text-5xl sm:text-7xl font-black ${moistureStatus.textColor}`}>{soilMoisture}</span>
            <span className="text-2xl sm:text-3xl text-gray-400 mb-2 sm:mb-3">%</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{moistureStatus.description}</p>
          
          {/* Progress Bar */}
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full ${moistureStatus.color} transition-all duration-500`} style={{ width: `${soilMoisture}%` }} />
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>40-70% Optimal</span>
            <span>100%</span>
          </div>
        </div>

        {/* ========== IRRIGATION STATUS CARD - Mobile Optimized ========== */}
        <div className={`rounded-2xl p-4 sm:p-5 shadow-lg border-l-4 ${irrigationStatus.bgColor} ${irrigationStatus.borderColor}`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Irrigation Status</h3>
            <SpeakButton text={irrigationRec.hindiReason} />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`size-12 sm:size-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${irrigationStatus.bgColor} ${irrigationStatus.color}`}>
              <span className="material-symbols-outlined text-[32px] sm:text-[40px]">{irrigationStatus.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-lg sm:text-2xl font-black ${irrigationStatus.color} truncate`}>{irrigationStatus.label}</p>
              {irrigationRec.waterAmount > 0 && (
                <p className="text-sm sm:text-lg font-bold text-primary mt-0.5 sm:mt-1">{irrigationRec.waterAmount}mm needed</p>
              )}
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{irrigationRec.urgency === 'critical' || irrigationRec.urgency === 'high' ? '⚠️ Action needed' : '✓ Monitored'}</p>
            </div>
          </div>
        </div>

        {/* ========== WATER SAVING CARD - Mobile Optimized ========== */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 sm:p-5 shadow-lg border border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="size-8 sm:size-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-cyan-600 text-xl sm:text-2xl">savings</span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Water Saved</h3>
          </div>
          <div className="flex items-end gap-1 sm:gap-2 mb-3 sm:mb-4">
            <span className="text-4xl sm:text-5xl font-black text-cyan-600">{waterSavedToday}</span>
            <span className="text-lg sm:text-xl text-gray-400 mb-1 sm:mb-2">Liters</span>
          </div>
          <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${waterSavingPercent}%` }} 
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-2">
            <p className="text-xs sm:text-sm text-gray-500">{waterSavingPercent}%</p>
            <p className="text-sm font-bold text-cyan-600">{waterSavingTarget}L goal</p>
          </div>
        </div>

        {/* ========== AI RECOMMENDATION CARD ========== */}
        <div className="bg-gradient-to-br from-[#111811] to-[#1a2e1a] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
              </div>
              AI Recommendation
            </h3>
            <SpeakButton text={irrigationRec.hindiReason} />
          </div>
          
          {/* Main Advice */}
          <p className="text-2xl font-black mb-3 capitalize relative z-10">
            {irrigationRec.action === 'stop' ? '🛑 Stop irrigation today' :
              irrigationRec.action === 'irrigate' ? `💧 Irrigate ${irrigationRec.waterAmount}mm today` :
              irrigationRec.action === 'wait' ? '⏳ Wait - Rain expected' :
                '⚠️ Reduce irrigation'}
          </p>
          
          {/* Urgency Badge */}
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
            irrigationRec.urgency === 'critical' ? 'bg-red-500/30 text-red-300' :
            irrigationRec.urgency === 'high' ? 'bg-orange-500/30 text-orange-300' :
            irrigationRec.urgency === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
            'bg-green-500/30 text-green-300'
          }`}>
            <span className="material-symbols-outlined text-[14px]">
              {irrigationRec.urgency === 'critical' ? 'warning' : 
               irrigationRec.urgency === 'high' ? 'priority_high' : 'check_circle'}
            </span>
            {irrigationRec.urgency.toUpperCase()} • {irrigationRec.confidence}% confident
          </div>
          
          {/* Explanation Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 relative z-10 border border-white/10">
            <p className="text-sm text-gray-200">
              <span className="text-primary font-bold block mb-1">Reason:</span> 
              {irrigationRec.hindiReason}
            </p>
          </div>
        </div>

        {/* ========== QUICK ACTIONS ========== */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate(Screen.FALLBACK)}
            className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a2e1a] p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 active:scale-95 transition-all"
          >
            <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">edit_note</span>
            </div>
            <span className="text-sm font-bold">Manual Input</span>
            <span className="text-xs text-gray-400">Offline Mode</span>
          </button>
          <button
            onClick={() => onNavigate(Screen.ALERTS)}
            className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a2e1a] p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 active:scale-95 transition-all"
          >
            <div className="size-16 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center relative">
              <span className="material-symbols-outlined text-[32px]">notifications_active</span>
              <span className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">3</span>
            </div>
            <span className="text-sm font-bold">View Alerts</span>
            <span className="text-xs text-red-500 font-semibold">3 Active</span>
          </button>
        </div>

        {/* Fertilizer Advisor - Compact */}
        <div className="rounded-2xl bg-white dark:bg-[#1a2e1a] p-5 shadow-md border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-600">compost</span>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fertilizer Advisor</h3>
          </div>

          {/* Crop Selector */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {['wheat', 'rice', 'cotton', 'sugarcane'].map(crop => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold capitalize ${selectedCrop === crop ? 'bg-primary text-black' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
              >
                {crop}
              </button>
            ))}
          </div>

          {/* Stage Selector */}
          <div className="flex gap-2 mb-4">
            {['sowing', 'vegetative', 'flowering'].map(stage => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize ${selectedStage === stage ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
              >
                {stage}
              </button>
            ))}
          </div>

          {/* Recommendation */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-amber-700">{fertilizerRec.fertilizer.type}</span>
              <SpeakButton text={fertilizerRec.hindiResponse} />
            </div>
            <p className="text-xl font-bold text-amber-900 dark:text-amber-200">{fertilizerRec.fertilizer.quantity}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{fertilizerRec.fertilizer.reason}</p>
            {fertilizerRec.warnings.length > 0 && (
              <p className="text-xs text-orange-600 mt-2">⚠️ {fertilizerRec.warnings[0]}</p>
            )}
          </div>
        </div>

        {/* System Status Panel - Compact */}
        <div className="rounded-2xl bg-white dark:bg-[#1a2e1a] p-4 shadow-md border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-gray-500">settings</span>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">System Status</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
              <div className={`size-3 rounded-full mx-auto mb-1 ${isIoTConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-[10px] font-medium text-gray-500">IoT</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
              <div className={`size-3 rounded-full mx-auto mb-1 ${sensorStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <p className="text-[10px] font-medium text-gray-500">Sensors</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
              <div className="size-3 rounded-full mx-auto mb-1 bg-amber-500" />
              <p className="text-[10px] font-medium text-gray-500">Offline</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
              <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
              <p className="text-[10px] font-medium text-gray-500">{lastSyncTime}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Voice Button */}
      <div className="fixed bottom-28 right-5 z-40">
        <VoiceButton size="large" />
        {isListening && (
          <div className="absolute -top-12 right-0 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
            Listening...
          </div>
        )}
        {lastResponse && !isListening && (
          <div className="absolute -top-16 right-0 bg-primary text-black px-3 py-2 rounded-lg text-sm max-w-[200px] shadow-lg">
            {lastResponse.slice(0, 50)}...
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark pb-6 pt-2 z-30">
        <div className="flex justify-around items-center px-2 h-16">
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined filled">home</span>
            <span className="text-[11px] font-bold">Home</span>
          </button>
          <button onClick={() => onNavigate(Screen.ALERTS)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-[11px] font-medium">Alerts</span>
          </button>
          <button onClick={() => onNavigate(Screen.AI_ASSISTANT)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">smart_toy</span>
            <span className="text-[11px] font-medium">AI</span>
          </button>
          <button onClick={() => onNavigate(Screen.SYNC)} className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-symbols-outlined">sync</span>
            <span className="text-[11px] font-medium">Sync</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
