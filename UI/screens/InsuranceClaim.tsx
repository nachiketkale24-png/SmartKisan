
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
}

const InsuranceClaim: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [damage, setDamage] = useState(60);

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark font-work">
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-lg font-bold flex-1 text-center pr-12">File Insurance Claim</h2>
      </header>

      <div className="flex justify-center gap-3 py-6 bg-white dark:bg-gray-900">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-2 rounded-full transition-all ${step === s ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'}`}></div>
        ))}
      </div>

      <main className="flex-1 flex flex-col gap-6 px-4 py-4 pb-32 overflow-y-auto">
        {/* Step 1: Take Photo */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-[22px] font-bold pb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
            Take Photo
          </h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors">
            <span className="material-symbols-outlined text-gray-400 text-[48px]">add_a_photo</span>
            <span className="text-gray-500 font-medium">Tap to capture damage</span>
          </div>
          <div className="flex items-center justify-center gap-6 pt-6">
            <button className="size-12 rounded-full bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined">photo_library</span></button>
            <button className="size-16 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center"><span className="material-symbols-outlined text-[32px] filled">photo_camera</span></button>
            <button className="size-12 rounded-full bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined">cached</span></button>
          </div>
        </div>

        {/* Step 2: Location */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-[22px] font-bold pb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
            Location
          </h2>
          <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-blue-500 filled">location_on</span></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Detected Village</span>
              <span className="text-xl font-bold">Ramnagar</span>
            </div>
            <div className="ml-auto"><span className="material-symbols-outlined text-green-600">check_circle</span></div>
          </div>
          <div className="mt-3 h-24 w-full rounded-lg bg-gray-200 relative overflow-hidden">
            <img src="https://picsum.photos/400/200?random=10" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center"><span className="material-symbols-outlined text-blue-500 text-3xl filled">location_on</span></div>
          </div>
        </div>

        {/* Step 3: Damage */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-[22px] font-bold pb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
            Damage Estimate
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end px-1">
              <span className="text-gray-500 font-medium text-lg">Severity</span>
              <span className="text-blue-500 text-3xl font-bold">{damage}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={damage} 
              onChange={(e) => setDamage(Number(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Low Loss</span>
              <span>Total Loss</span>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 z-50 shadow-lg">
        <button onClick={onBack} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg flex items-center justify-center gap-3">
          <span>Submit Claim</span>
          <span className="material-symbols-outlined">check</span>
        </button>
        <div className="text-center mt-2 flex items-center justify-center gap-1 text-gray-400 text-xs">
          <span className="material-symbols-outlined text-sm">cloud_off</span>
          <span>Offline mode active. Data will sync later.</span>
        </div>
      </div>
    </div>
  );
};

export default InsuranceClaim;
