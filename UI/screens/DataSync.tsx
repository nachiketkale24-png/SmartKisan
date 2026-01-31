
import React from 'react';

interface Props {
  onBack: () => void;
}

const DataSync: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center px-6 py-5 bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-full hover:bg-slate-100"><span className="material-symbols-outlined text-3xl">arrow_back</span></button>
        <h1 className="text-2xl font-bold flex-1 text-center pr-12">Data Sync</h1>
      </header>

      <main className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto pb-32">
        <div className="relative flex flex-col items-center justify-center gap-4 rounded-2xl bg-white dark:bg-surface-dark p-8 shadow-md border-l-8 border-primary">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full blur-xl animate-pulse"></div>
            <span className="material-symbols-outlined text-6xl text-green-600 relative z-10">cloud_done</span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Sync Status</p>
            <h2 className="text-xl font-bold">Last Synced: Today, 10:00 AM</h2>
            <p className="text-primary text-base font-semibold mt-2">Ready to upload</p>
          </div>
        </div>

        <div className="flex items-end justify-between px-2">
          <h2 className="text-2xl font-bold">Pending Items</h2>
          <span className="text-slate-500 text-sm font-medium mb-1">3 Total</span>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { title: '1 Insurance Claim', sub: 'Waiting for upload', icon: 'shield', color: 'bg-orange-100 text-orange-700' },
            { title: '2 Crop Scans', sub: 'Large files (12MB)', icon: 'photo_camera', color: 'bg-blue-100 text-blue-700' },
            { title: '3 Water Logs', sub: 'Text data', icon: 'water_drop', color: 'bg-cyan-100 text-cyan-700' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
              <div className={`flex items-center justify-center rounded-lg size-14 shrink-0 ${item.color}`}>
                <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-xl font-bold leading-tight">{item.title}</p>
                <span className="text-slate-500 text-sm">{item.sub}</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-3xl">pending</span>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-surface-dark p-6 pb-8 border-t border-slate-100 shadow-2xl">
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-primary w-[5%]"></div>
        </div>
        <button className="w-full bg-primary hover:bg-[#0fd60f] h-[72px] rounded-xl text-black font-extrabold text-2xl uppercase tracking-wide shadow-lg flex items-center justify-center gap-3 active:scale-[0.99] group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-180 transition-transform duration-700">sync</span>
          SYNC NOW
        </button>
        <button className="w-full text-center mt-6 text-slate-500 font-medium underline underline-offset-4 decoration-slate-300">
          Clear saved data
        </button>
      </div>
    </div>
  );
};

export default DataSync;
