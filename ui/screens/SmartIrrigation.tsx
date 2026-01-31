
import React, { useState, useEffect } from 'react';
import { DEMO_DATA } from '../types';

interface Props {
  onBack: () => void;
}

const SmartIrrigation: React.FC<Props> = ({ onBack }) => {
  const [moisture, setMoisture] = useState(DEMO_DATA.soilMoisture);
  const [soil, setSoil] = useState('clay');
  const [crop, setCrop] = useState('wheat');
  const [recommendation, setRecommendation] = useState(DEMO_DATA.recommendation);

  // Update recommendation based on moisture changes
  useEffect(() => {
    if (moisture > 70) {
      setRecommendation({
        action: 'Stop irrigation today',
        reason: `Soil moisture above optimal range (${moisture}% > 70%)`
      });
    } else if (moisture < 30) {
      setRecommendation({
        action: `Irrigate ${Math.round((60 - moisture) * 0.5)}mm today`,
        reason: `Soil moisture critically low (${moisture}% < 30%)`
      });
    } else if (moisture < 50) {
      setRecommendation({
        action: `Irrigate ${Math.round((60 - moisture) * 0.3)}mm today`,
        reason: `Soil moisture below optimal (${moisture}%)`
      });
    } else {
      setRecommendation({
        action: 'No irrigation needed today',
        reason: `Soil moisture optimal (${moisture}%)`
      });
    }
  }, [moisture]);

  const getMoistureStatus = (value: number) => {
    if (value >= 30 && value <= 60) return { status: 'Optimal', color: 'text-green-600', bgColor: 'bg-green-500' };
    if (value < 30 || value > 80) return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-500' };
    return { status: 'Warning', color: 'text-orange-600', bgColor: 'bg-orange-500' };
  };

  const moistureStatus = getMoistureStatus(moisture);

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center p-4 bg-white dark:bg-background-dark shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold flex-1 text-center pr-12">Smart Irrigation</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
        {/* AI Recommendation Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            <span className="text-sm font-bold text-green-800 dark:text-green-200">AI Recommendation</span>
          </div>
          <p className="text-lg font-bold text-green-700 dark:text-green-300 mb-1">{recommendation.action}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Reason:</span> {recommendation.reason}
          </p>
        </div>

        {/* Soil Type Section */}
        <section>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-700">landscape</span>
            Soil Type
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'sandy', icon: 'grain', label: 'Sandy' },
              { id: 'clay', icon: 'filter_hdr', label: 'Clay' },
              { id: 'loam', icon: 'grass', label: 'Loam' }
            ].map(s => (
              <button 
                key={s.id} 
                onClick={() => setSoil(s.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all h-24 ${soil === s.id ? 'border-primary bg-green-50 dark:bg-green-900/30 shadow-md' : 'border-transparent bg-white dark:bg-gray-800 shadow-sm'}`}
              >
                <span className={`material-symbols-outlined text-3xl mb-1 ${soil === s.id ? 'text-primary' : 'text-gray-400'}`}>{s.icon}</span>
                <span className="text-sm font-semibold">{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Moisture Section with Status */}
        <section className="bg-white dark:bg-[#1a2e1a] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">water_drop</span>
              <h3 className="text-base font-bold">Soil Moisture</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${moistureStatus.color}`}>{moisture}%</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${moistureStatus.bgColor} text-white`}>
                {moistureStatus.status}
              </span>
            </div>
          </div>
          
          <div className="relative w-full h-12 flex items-center">
            <div className="absolute w-full h-4 rounded-full bg-gradient-to-r from-red-400 via-green-400 to-blue-500 opacity-30"></div>
            <input 
              type="range" 
              min="0" max="100" 
              value={moisture} 
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full h-4 appearance-none bg-transparent relative z-10 cursor-pointer accent-primary" 
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-400 mt-1">
            <span className="text-red-500">Dry</span>
            <span className="text-green-500">Optimal 30-60%</span>
            <span className="text-blue-500">Wet</span>
          </div>
        </section>

        {/* Crop Selection */}
        <section>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-600">agriculture</span>
            Crop Type
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'rice', icon: 'water_drop', label: 'Rice' },
              { id: 'wheat', icon: 'grain', label: 'Wheat' },
              { id: 'cotton', icon: 'checkroom', label: 'Cotton' },
              { id: 'sugarcane', icon: 'forest', label: 'Sugarcane' }
            ].map(c => (
              <button 
                key={c.id} 
                onClick={() => setCrop(c.id)}
                className={`shrink-0 flex items-center gap-2 px-5 h-11 rounded-full border transition-all shadow-sm ${crop === c.id ? 'bg-primary border-primary text-black font-bold' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                <p className="text-sm font-semibold whitespace-nowrap">{c.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Irrigation Plan Card */}
        <div className="bg-[#111811] text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Irrigation Plan
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center divide-x divide-white/10">
            <div className="flex flex-col items-center gap-1">
              <div className="bg-blue-500/20 p-2 rounded-full"><span className="material-symbols-outlined text-blue-400">water_drop</span></div>
              <p className="text-xl font-bold">{moisture < 50 ? Math.round((60 - moisture) * 0.3) : 0}<span className="text-xs font-normal text-gray-400 ml-0.5">mm</span></p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Water</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="bg-orange-500/20 p-2 rounded-full"><span className="material-symbols-outlined text-orange-400">timer</span></div>
              <p className="text-xl font-bold">{moisture < 50 ? Math.round((60 - moisture) * 0.5) : 0}<span className="text-xs font-normal text-gray-400 ml-0.5">min</span></p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Duration</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="bg-primary/20 p-2 rounded-full"><span className="material-symbols-outlined text-primary">event_repeat</span></div>
              <p className="text-xl font-bold">2<span className="text-xs font-normal text-gray-400 ml-0.5">days</span></p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Repeat</p>
            </div>
          </div>
        </div>

        {/* Water Saving Stats */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-cyan-100 dark:border-cyan-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-cyan-600">savings</span>
            <span className="text-sm font-bold text-cyan-800 dark:text-cyan-200">Water Saved This Week</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">2,450</span>
            <span className="text-sm text-cyan-500 mb-1">Liters</span>
          </div>
          <div className="h-2 bg-white/50 dark:bg-gray-700/50 rounded-full overflow-hidden mt-2">
            <div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 w-full p-4 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
        <button className="w-full bg-primary hover:bg-green-400 text-black h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined">save_alt</span>
          Save Plan Offline
        </button>
      </div>
    </div>
  );
};

export default SmartIrrigation;
