
import React, { useState } from 'react';
import { Screen } from '../types';

interface Props {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

// Result type for irrigation check
interface IrrigationResult {
  status: 'normal' | 'irrigate' | 'stop';
  recommendation: string;
  reason: string;
  waterAmount?: number;
}

const OfflineInputScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
  // Input states
  const [soilMoisture, setSoilMoisture] = useState(50);
  const [isRaining, setIsRaining] = useState(false);
  const [temperature, setTemperature] = useState('30');
  
  // Result state
  const [result, setResult] = useState<IrrigationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Offline irrigation check logic (no backend dependency)
  const runIrrigationCheck = () => {
    setIsChecking(true);
    
    // Simulate processing delay for demo
    setTimeout(() => {
      const temp = parseInt(temperature) || 30;
      let irrigationResult: IrrigationResult;

      // Simple rule-based offline logic
      if (isRaining) {
        irrigationResult = {
          status: 'stop',
          recommendation: 'Stop irrigation today',
          reason: 'Rain detected - natural irrigation sufficient'
        };
      } else if (soilMoisture > 70) {
        irrigationResult = {
          status: 'stop',
          recommendation: 'Stop irrigation today',
          reason: `Soil moisture too high (${soilMoisture}% > 70%)`
        };
      } else if (soilMoisture < 30) {
        const waterNeeded = Math.round((60 - soilMoisture) * 0.5);
        irrigationResult = {
          status: 'irrigate',
          recommendation: `Irrigate ${waterNeeded}mm today`,
          reason: `Soil moisture critically low (${soilMoisture}% < 30%)`,
          waterAmount: waterNeeded
        };
      } else if (soilMoisture < 50 && temp > 35) {
        const waterNeeded = Math.round((60 - soilMoisture) * 0.3);
        irrigationResult = {
          status: 'irrigate',
          recommendation: `Irrigate ${waterNeeded}mm today`,
          reason: `High temperature (${temp}°C) with moderate soil moisture`,
          waterAmount: waterNeeded
        };
      } else {
        irrigationResult = {
          status: 'normal',
          recommendation: 'No irrigation needed today',
          reason: `Soil moisture optimal (${soilMoisture}%)`
        };
      }

      setResult(irrigationResult);
      setIsChecking(false);
    }, 1500);
  };

  const getResultColor = (status: IrrigationResult['status']) => {
    switch (status) {
      case 'stop': return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: 'do_not_disturb', iconColor: 'text-red-600' };
      case 'irrigate': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'water_drop', iconColor: 'text-blue-600' };
      default: return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: 'check_circle', iconColor: 'text-green-600' };
    }
  };

  const getMoistureColor = (value: number) => {
    if (value < 30) return 'text-red-600';
    if (value > 70) return 'text-red-600';
    if (value < 40 || value > 60) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-background-dark shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold flex-1 text-center pr-12">Manual Input</h2>
      </header>

      {/* Offline Badge */}
      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
        <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
          <span className="material-symbols-outlined text-[18px]">cloud_off</span>
          <span className="text-sm font-semibold">Offline Fallback Mode</span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-32">
        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">info</span>
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">No Internet? No Problem!</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">Enter your field data manually and get irrigation recommendations offline.</p>
            </div>
          </div>
        </div>

        {/* Soil Moisture Slider */}
        <div className="bg-white dark:bg-[#1a2e1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-[24px]">water_drop</span>
              <h3 className="text-base font-bold">Soil Moisture</h3>
            </div>
            <span className={`text-2xl font-bold ${getMoistureColor(soilMoisture)}`}>{soilMoisture}%</span>
          </div>
          
          <div className="relative w-full h-14 flex items-center">
            <div className="absolute w-full h-4 rounded-full bg-gradient-to-r from-red-400 via-green-400 to-blue-500 opacity-30"></div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={soilMoisture} 
              onChange={(e) => { setSoilMoisture(Number(e.target.value)); setResult(null); }}
              className="w-full h-4 appearance-none bg-transparent relative z-10 cursor-pointer" 
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #22c55e 30%, #22c55e 60%, #3b82f6 100%)`,
                borderRadius: '9999px'
              }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-400 mt-2">
            <span className="text-red-500">Dry (0%)</span>
            <span className="text-green-500">Optimal</span>
            <span className="text-blue-500">Wet (100%)</span>
          </div>
        </div>

        {/* Rain Toggle */}
        <div className="bg-white dark:bg-[#1a2e1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`size-12 rounded-xl flex items-center justify-center ${isRaining ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <span className={`material-symbols-outlined text-[28px] ${isRaining ? 'text-blue-600' : 'text-gray-400'}`}>
                  {isRaining ? 'rainy' : 'sunny'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold">Is it Raining?</h3>
                <p className="text-xs text-gray-500">Current weather condition</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={() => { setIsRaining(!isRaining); setResult(null); }}
              className={`relative w-16 h-9 rounded-full transition-all ${isRaining ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`absolute top-1 size-7 bg-white rounded-full shadow-md transition-all ${isRaining ? 'left-8' : 'left-1'}`}></div>
              <span className={`absolute top-1.5 text-[10px] font-bold ${isRaining ? 'left-2 text-white' : 'right-2 text-gray-500'}`}>
                {isRaining ? 'YES' : 'NO'}
              </span>
            </button>
          </div>
        </div>

        {/* Temperature Input */}
        <div className="bg-white dark:bg-[#1a2e1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-orange-500 text-[24px]">thermostat</span>
            <h3 className="text-base font-bold">Temperature</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input 
                type="number"
                value={temperature}
                onChange={(e) => { setTemperature(e.target.value); setResult(null); }}
                placeholder="Enter temperature"
                className="w-full h-14 px-4 text-xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div className="h-14 px-4 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <span className="text-xl font-bold text-orange-600">°C</span>
            </div>
          </div>
          
          {/* Quick Temperature Buttons */}
          <div className="flex gap-2 mt-3">
            {[25, 30, 35, 40].map((temp) => (
              <button 
                key={temp}
                onClick={() => { setTemperature(temp.toString()); setResult(null); }}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
                  temperature === temp.toString() 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {temp}°
              </button>
            ))}
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div className={`rounded-2xl p-5 border-2 ${getResultColor(result.status).bg} ${getResultColor(result.status).border} animate-fade-in`}>
            <div className="flex items-start gap-4">
              <div className={`size-14 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm`}>
                <span className={`material-symbols-outlined text-[36px] ${getResultColor(result.status).iconColor}`}>
                  {getResultColor(result.status).icon}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-1">{result.recommendation}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                  <span><strong>Reason:</strong> {result.reason}</span>
                </p>
                {result.waterAmount && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="material-symbols-outlined text-blue-500">water_drop</span>
                    <span className="text-sm font-semibold">Water needed: <span className="text-blue-600">{result.waterAmount}mm</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Action Button */}
      <div className="absolute bottom-0 w-full p-4 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={runIrrigationCheck}
          disabled={isChecking}
          className={`w-full h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all ${
            isChecking 
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-primary hover:bg-green-400 text-black'
          }`}
        >
          {isChecking ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Checking...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[28px]">play_circle</span>
              Run Irrigation Check
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OfflineInputScreen;
