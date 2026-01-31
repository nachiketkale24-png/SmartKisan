
import React, { useState } from 'react';
import { analyzeCropImage } from '../services/geminiService';
import { Diagnosis } from '../types';

interface Props {
  onBack: () => void;
  onClaim: () => void;
}

const CropScanner: React.FC<Props> = ({ onBack, onClaim }) => {
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImage(base64);
        setLoading(true);
        try {
          const result = await analyzeCropImage(base64);
          setDiagnosis(result);
        } catch (error) {
          console.error("Diagnosis failed:", error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-full hover:bg-gray-100"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-xl font-bold flex-1 text-center pr-12">Crop Scanner</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-24">
        <section className="grid grid-cols-2 gap-4">
          <label className="flex flex-col items-center justify-center gap-3 bg-primary text-black rounded-xl p-6 shadow-lg h-40 cursor-pointer active:scale-95 transition-all">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <div className="bg-white/30 rounded-full p-4 flex items-center justify-center"><span className="material-symbols-outlined text-[40px] font-bold">photo_camera</span></div>
            <span className="text-lg font-bold">Take Photo</span>
          </label>
          <label className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 text-slate-900 dark:text-white rounded-xl p-6 shadow-md h-40 cursor-pointer active:scale-95 transition-all border-2 border-gray-200">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 flex items-center justify-center"><span className="material-symbols-outlined text-[40px]">image</span></div>
            <span className="text-lg font-bold">Upload</span>
          </label>
        </section>

        {loading && (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-lg">AI Doctor is analyzing your crop...</p>
          </div>
        )}

        {diagnosis && (
          <section className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Diagnosis Result</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full border border-green-200">Scan Complete</span>
            </div>
            
            <div className="bg-white dark:bg-[#1a2e1a] rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}></div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Detected Disease</p>
                    <h3 className="text-red-600 text-2xl font-extrabold">{diagnosis.disease}</h3>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 px-3 py-1 text-sm font-bold w-fit">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    {diagnosis.stressLevel} Stress
                  </div>
                </div>
              </div>
              <div className="p-5 bg-gray-50 dark:bg-white/5">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold">Risk Severity</span>
                  <span className="text-yellow-600 font-bold text-lg">{diagnosis.severity}%</span>
                </div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div className="h-full bg-yellow-500" style={{ width: `${diagnosis.severity}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
               <h3 className="text-xl font-bold px-1">AI Doctor Suggestions</h3>
               {diagnosis.suggestions.map((s, i) => (
                 <div key={i} className="bg-white dark:bg-[#1a2e1a] rounded-xl border border-gray-100 p-4 flex items-start gap-4 shadow-sm">
                   <div className="bg-blue-100 p-3 rounded-lg text-blue-600 shrink-0"><span className="material-symbols-outlined">info</span></div>
                   <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{s}</p>
                 </div>
               ))}
            </div>

            <button 
              onClick={onClaim}
              className="mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl px-6 py-4 shadow-xl flex items-center justify-center gap-3 font-bold"
            >
              <span className="material-symbols-outlined">save</span>
              Save for Insurance Claim
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default CropScanner;
