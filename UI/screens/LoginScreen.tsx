
import React, { useState } from 'react';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin, onBack }) => {
  const [phone, setPhone] = useState('');

  return (
    <div className="h-screen flex flex-col p-4 bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between pt-2 pb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold pr-10">Agri-Protect</h2>
        <div></div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-8">
        <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 ring-1 ring-primary/30">
          <span className="material-symbols-outlined text-green-700 dark:text-primary text-4xl">eco</span>
        </div>
        <h1 className="text-2xl font-bold mb-6">Welcome Farmer</h1>
        
        <div className="w-full text-center mb-8">
          <h2 className="text-[28px] font-bold leading-tight">Enter mobile number to start</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">We will send you a one-time password (OTP)</p>
        </div>

        <div className="w-full space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold ml-1">Mobile Number</p>
            <div className="flex items-stretch rounded-xl bg-white dark:bg-[#1a2e1a] border border-[#dbe6db] dark:border-[#2a452a] focus-within:ring-2 focus-within:ring-primary overflow-hidden h-14">
              <div className="flex items-center px-4 bg-gray-50 dark:bg-[#152515] border-r border-[#dbe6db] dark:border-[#2a452a] font-bold text-lg">+91</div>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="00000 00000"
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-xl font-medium tracking-wide"
              />
              <div className="flex items-center pr-4 text-primary">
                <span className="material-symbols-outlined">smartphone</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full bg-primary hover:bg-[#0fd60f] text-black h-14 rounded-xl font-bold text-lg flex items-center justify-center relative shadow-lg"
          >
            <span>Send OTP</span>
            <span className="material-symbols-outlined absolute right-5">arrow_forward</span>
          </button>

          <div className="flex items-center gap-3 py-4 opacity-60">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full h-12 rounded-xl bg-gray-100 dark:bg-[#1a2e1a] border border-gray-200 dark:border-[#2a452a] font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-gray-600 text-xl">person_outline</span>
            <span>Guest / Demo Mode</span>
          </button>
        </div>

        <div className="mt-auto py-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-[#1a2e1a] border border-green-100 dark:border-[#2a452a]">
            <span className="material-symbols-outlined text-green-700 dark:text-primary text-sm">verified_user</span>
            <span className="text-xs font-bold text-green-800 dark:text-green-100 uppercase tracking-wider">100% Secure & Private</span>
          </div>
          <p className="text-[11px] text-gray-400 text-center max-w-[250px] leading-relaxed">
            By continuing, you agree to the Agri-Protect <span className="underline">Terms</span> & <span className="underline">Privacy Policy</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
