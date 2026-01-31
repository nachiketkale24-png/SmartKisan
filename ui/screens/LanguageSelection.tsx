
import React, { useState } from 'react';

interface Props {
  onContinue: () => void;
}

const languages = [
  { id: 'hi', native: 'हिन्दी', english: 'Hindi', char: 'अ', color: 'bg-orange-100 text-orange-600' },
  { id: 'mr', native: 'मराठी', english: 'Marathi', char: 'म', color: 'bg-blue-100 text-blue-600' },
  { id: 'en', native: 'English', english: 'English', char: 'Aa', color: 'bg-purple-100 text-purple-600' },
];

const LanguageSelection: React.FC<Props> = ({ onContinue }) => {
  const [selected, setSelected] = useState('hi');

  return (
    <div className="h-screen flex flex-col p-4 bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between pt-4 pb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">agriculture</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-gray-500">Kisan Protect</span>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark"><span className="material-symbols-outlined">help</span></button>
      </header>

      <div className="pb-6">
        <h1 className="text-3xl font-bold">Language <span className="text-gray-400 font-light mx-2">/</span> भाषा</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Select your preferred language</p>
      </div>

      <main className="flex-1 flex flex-col gap-4 overflow-y-auto pb-24">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelected(lang.id)}
            className={`flex w-full items-center justify-between p-5 rounded-2xl border-[3px] transition-all active:scale-[0.98] ${
              selected === lang.id 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-xl font-bold text-3xl ${lang.color}`}>
                {lang.char}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-3xl font-bold leading-tight">{lang.native}</span>
                <span className="text-base text-gray-500 font-medium">{lang.english}</span>
              </div>
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
              selected === lang.id ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-500'
            }`}>
              {selected === lang.id && <div className="h-3 w-3 rounded-full bg-white"></div>}
            </div>
          </button>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 max-w-md mx-auto z-10">
        <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
        <button 
          onClick={onContinue}
          className="w-full bg-primary hover:bg-[#0fd60f] text-black text-xl font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <span>Continue</span>
          <span className="opacity-80 font-normal">|</span>
          <span>आगे बढ़ें</span>
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelection;
