
import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="h-screen flex flex-col justify-between items-center px-8 py-12 bg-background-light dark:bg-background-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-[#dffadf] to-transparent dark:from-[#051a05] pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl transform scale-110 transition-transform duration-700"></div>
          <div className="relative w-40 h-40 rounded-full bg-white dark:bg-[#1a2e1a] flex items-center justify-center shadow-lg border-[6px] border-[#e8f5e8] dark:border-[#2a402a]">
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[96px] filled">shield</span>
              <span className="material-symbols-outlined text-[#14532d] dark:text-[#ffffff] text-[48px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">eco</span>
            </div>
          </div>
        </div>
        <h1 className="text-[#111811] dark:text-white tracking-tight text-[40px] font-extrabold leading-[1.1] text-center mb-3">Agri-Insure</h1>
        <h2 className="text-[#3a5a3a] dark:text-[#a0cfa0] text-[22px] font-medium leading-snug text-center max-w-[90%]">Offline-first Smart Farming System</h2>
      </div>

      <div className="w-full z-10">
        <div className="flex flex-col gap-4 mb-10">
          <p className="text-[#111811] dark:text-white text-lg font-medium text-center animate-pulse">Loading your farm data...</p>
          <div className="rounded-full bg-[#dbe6db] dark:bg-gray-700 h-4 w-full overflow-hidden shadow-inner border border-black/5 dark:border-white/10">
            <div className="h-full rounded-full bg-primary relative transition-all duration-75" style={{ width: `${progress}%` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -skew-x-12"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-[#618961] dark:text-[#8ab88a] text-xs font-semibold uppercase tracking-widest">In partnership with</p>
          <div className="flex items-center gap-4 opacity-70">
            <div className="flex items-center gap-1.5 grayscale">
              <span className="material-symbols-outlined text-2xl">account_balance</span>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Govt of India</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-1.5 grayscale">
              <span className="material-symbols-outlined text-2xl">security</span>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Insure Corp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
