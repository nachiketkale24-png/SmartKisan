import React, { useState } from 'react';
import { getIrrigationRecommendation } from '../utils/mockAI';
import SpeakButton from '../components/SpeakButton';

interface Props {
  onBack: () => void;
}

const SmartIrrigation: React.FC<Props> = ({ onBack }) => {
  const [moisture, setMoisture] = useState(45);
  const [soil, setSoil] = useState('clay');
  const [crop, setCrop] = useState('wheat');
  const [isRaining, setIsRaining] = useState(false);
  const [temperature] = useState(28);

  // Get AI recommendation based on current values
  const recommendation = getIrrigationRecommendation({
    soilMoisture: moisture,
    temperature,
    isRaining
  });

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center p-4 bg-white dark:bg-background-dark shadow-sm z-10 sticky top-0">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-full hover:bg-gray-100"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-xl font-bold flex-1 text-center pr-12">Smart Irrigation</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-green-700">landscape</span>Soil Type</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'sandy', icon: 'grain', label: 'Sandy' },
              { id: 'clay', icon: 'filter_hdr', label: 'Clay' },
              { id: 'loam', icon: 'grass', label: 'Loam' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSoil(s.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all h-28 ${soil === s.id ? 'border-primary bg-green-50 shadow-md' : 'border-transparent bg-white dark:bg-gray-800 shadow-sm'}`}
              >
                <span className={`material-symbols-outlined text-4xl mb-2 ${soil === s.id ? 'text-primary' : 'text-gray-400'}`}>{s.icon}</span>
                <span className="text-sm font-semibold">{s.label}</span>
                {soil === s.id && <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-xl">check_circle</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">opacity</span>Moisture</h3>
            <span className="text-2xl font-bold text-primary">{moisture}%</span>
          </div>
          <div className="relative w-full h-12 flex items-center">
            <div className="absolute w-full h-3 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-blue-500 opacity-50"></div>
            <input
              type="range"
              min="0" max="100"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full h-3 appearance-none bg-transparent relative z-10 cursor-pointer accent-primary"
            />
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-500 mt-1">
            <span>Dry</span>
            <span>Wet</span>
          </div>
        </section>

        {/* Rain Toggle */}
        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-500">rainy</span>
              Rain Today?
            </h3>
            <button
              onClick={() => setIsRaining(!isRaining)}
              className={`w-16 h-8 rounded-full transition-all ${isRaining ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`size-6 bg-white rounded-full shadow-md transition-transform ${isRaining ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-yellow-600">agriculture</span>Crop</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'rice', icon: 'water_drop', label: 'Rice' },
              { id: 'wheat', icon: 'grain', label: 'Wheat' },
              { id: 'cotton', icon: 'checkroom', label: 'Cotton' },
              { id: 'sugarcane', icon: 'forest', label: 'Sugarcane' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCrop(c.id)}
                className={`shrink-0 flex items-center gap-3 px-6 h-12 rounded-full border transition-all shadow-sm ${crop === c.id ? 'bg-primary border-primary text-black' : 'bg-white dark:bg-gray-800 border-gray-200'}`}
              >
                <span className="material-symbols-outlined">{c.icon}</span>
                <p className="text-sm font-bold whitespace-nowrap">{c.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* AI Recommendation Panel */}
        <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden ${recommendation.status === 'normal' ? 'bg-green-900' :
            recommendation.status === 'warning' ? 'bg-orange-900' :
              'bg-red-900'
          } text-white`}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-white">psychology</span>
              AI Irrigation Advice
            </h3>
            <SpeakButton text={recommendation.reason} className="bg-white/20 text-white" />
          </div>

          {/* Main Advice */}
          <p className="text-3xl font-bold mb-3">
            {recommendation.action === 'stop' ? 'Stop Irrigation' :
              recommendation.action === 'irrigate' ? `Irrigate ${recommendation.amount}mm` :
                'Reduce Irrigation'}
          </p>

          {/* Explanation */}
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm font-semibold text-white/70 mb-1">Reason:</p>
            <p className="text-base">{recommendation.reason}</p>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${recommendation.status === 'normal' ? 'bg-green-500' :
                recommendation.status === 'warning' ? 'bg-orange-500' :
                  'bg-red-500'
              }`}>
              {recommendation.status}
            </span>
            <span className="text-sm text-white/70">Based on current sensor data</span>
          </div>
        </div>

        <div className="bg-[#111811] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-medium text-gray-300 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Irrigation Plan
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-500/20 p-2 rounded-full"><span className="material-symbols-outlined text-blue-400">water_drop</span></div>
              <p className="text-2xl font-bold">{recommendation.amount}<span className="text-sm font-normal text-gray-400 ml-0.5">mm</span></p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Water</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-orange-500/20 p-2 rounded-full"><span className="material-symbols-outlined text-orange-400">timer</span></div>
              <p className="text-2xl font-bold">30<span className="text-sm font-normal text-gray-400 ml-0.5">min</span></p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Duration</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-full"><span className="material-symbols-outlined text-primary">event_repeat</span></div>
              <p className="text-2xl font-bold">2<span className="text-sm font-normal text-gray-400 ml-0.5">days</span></p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Repeat</p>
            </div>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-gray-100">
        <button className="w-full bg-primary hover:bg-green-400 text-black h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined">save_alt</span>
          Save Plan Offline
        </button>
      </div>
    </div>
  );
};

export default SmartIrrigation;
