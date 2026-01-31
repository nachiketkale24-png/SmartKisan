import React, { useState } from 'react';
import { AgriGuardAI } from '../ai_engine';
import { IrrigationDecision } from '../ai_engine/irrigationEngine';
import { useOffline } from '../contexts/OfflineContext';
import SpeakButton from '../components/SpeakButton';

interface Props {
    onBack: () => void;
}

const OfflineFallback: React.FC<Props> = ({ onBack }) => {
    const { isDemoMode } = useOffline();
    const [soilMoisture, setSoilMoisture] = useState(50);
    const [isRaining, setIsRaining] = useState(false);
    const [temperature, setTemperature] = useState(28);
    const [result, setResult] = useState<IrrigationDecision | null>(null);

    const handleCheck = () => {
        // Update AI Engine with current values
        AgriGuardAI.updateSensorData({
            soilMoisture,
            temperature,
            isRaining,
        });
        // Get recommendation from AI Engine
        const recommendation = AgriGuardAI.getIrrigationAdvice();
        setResult(recommendation);
    };

    const getStatusColor = (urgency: string) => {
        switch (urgency) {
            case 'low': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'high': return 'bg-orange-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getMoistureColor = () => {
        if (soilMoisture < 30) return 'text-orange-500';
        if (soilMoisture > 80) return 'text-red-500';
        return 'text-green-500';
    };

    return (
        <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
            {/* Header - Mobile Optimized */}
            <header className="flex items-center px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm safe-area-top">
                <button onClick={onBack} className="size-10 sm:size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg sm:text-xl font-bold flex-1 text-center pr-10 sm:pr-12">Manual Input</h1>
            </header>

            {/* Offline Badge - Mobile Optimized */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 sm:gap-3">
                <span className="material-symbols-outlined text-xl sm:text-2xl">cloud_off</span>
                <div className="text-center">
                    <span className="font-bold text-sm sm:text-lg">Offline Mode</span>
                    <span className="text-xs sm:text-sm ml-1 sm:ml-2 opacity-80">No internet needed</span>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-5 pb-28 sm:pb-32 scroll-smooth">
                {/* Info Card - Mobile */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <span className="material-symbols-outlined text-blue-500 text-xl sm:text-2xl shrink-0">info</span>
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        Internet nahi? Data manually enter karein.
                    </p>
                </div>

                {/* ========== SOIL MOISTURE SLIDER - Mobile ========== */}
                <section className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h3 className="text-sm sm:text-lg font-bold flex items-center gap-2">
                            <div className="size-8 sm:size-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-blue-500 text-lg sm:text-xl">water_drop</span>
                            </div>
                            Soil Moisture
                        </h3>
                        <span className={`text-2xl sm:text-3xl font-black ${getMoistureColor()}`}>{soilMoisture}%</span>
                    </div>
                    
                    {/* Custom Slider Track - Larger for touch */}
                    <div className="relative py-3 sm:py-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={soilMoisture}
                            onChange={(e) => setSoilMoisture(Number(e.target.value))}
                            className="w-full h-8 sm:h-6 appearance-none bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer accent-primary touch-manipulation"
                            style={{
                                background: `linear-gradient(to right, #22c55e ${soilMoisture}%, #e5e7eb ${soilMoisture}%)`
                            }}
                        />
                    </div>
                    
                    {/* Labels */}
                    <div className="flex justify-between text-xs sm:text-sm font-semibold mt-1">
                        <span className="text-orange-500">🏜️ Dry</span>
                        <span className="text-green-500">✓ OK</span>
                        <span className="text-blue-500">💧 Wet</span>
                    </div>
                </section>

                {/* ========== RAIN TOGGLE - Mobile ========== */}
                <section className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`size-10 sm:size-12 rounded-full flex items-center justify-center shrink-0 ${isRaining ? 'bg-cyan-100 dark:bg-cyan-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl sm:text-2xl ${isRaining ? 'text-cyan-500' : 'text-gray-400'}`}>
                                    {isRaining ? 'rainy' : 'wb_sunny'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-lg font-bold">Rain?</h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {isRaining ? '🌧️ Yes' : '☀️ No'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Large Toggle Button - Touch Friendly */}
                        <button
                            onClick={() => setIsRaining(!isRaining)}
                            className={`w-20 sm:w-24 h-10 sm:h-12 rounded-full transition-all shadow-inner flex items-center touch-manipulation ${isRaining ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <div className={`size-8 sm:size-10 bg-white rounded-full shadow-lg transition-transform flex items-center justify-center ${isRaining ? 'translate-x-11 sm:translate-x-13' : 'translate-x-1'}`}>
                                <span className="material-symbols-outlined text-lg sm:text-xl text-gray-600">
                                    {isRaining ? 'check' : 'close'}
                                </span>
                            </div>
                        </button>
                    </div>
                </section>

                {/* ========== TEMPERATURE INPUT - Mobile ========== */}
                <section className="bg-white dark:bg-surface-dark p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="size-10 sm:size-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-orange-500 text-xl sm:text-2xl">thermostat</span>
                        </div>
                        <h3 className="text-sm sm:text-lg font-bold">Temperature</h3>
                    </div>
                    
                    {/* Large Touch-Friendly Controls */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6">
                        <button
                            onClick={() => setTemperature(Math.max(0, temperature - 1))}
                            className="size-14 sm:size-16 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl sm:text-3xl font-bold active:scale-90 transition-all shadow-md touch-manipulation"
                        >
                            −
                        </button>
                        <div className="text-center px-4 sm:px-6">
                            <span className="text-4xl sm:text-5xl font-black">{temperature}</span>
                            <span className="text-xl sm:text-2xl text-gray-400 ml-1">°C</span>
                        </div>
                        <button
                            onClick={() => setTemperature(Math.min(50, temperature + 1))}
                            className="size-14 sm:size-16 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl sm:text-3xl font-bold active:scale-90 transition-all shadow-md touch-manipulation"
                        >
                            +
                        </button>
                    </div>
                    
                    {/* Temperature Status */}
                    <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                        {temperature > 35 ? '🔥 Hot' : temperature < 15 ? '❄️ Cold' : '✓ Normal'}
                    </p>
                </section>

                {/* ========== RESULT CARD - Mobile ========== */}
                {result && (
                    <section className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border-l-4 ${
                        result.urgency === 'low' ? 'bg-green-50 dark:bg-green-900/20 border-l-green-500' :
                        result.urgency === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500' :
                        result.urgency === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-l-orange-500' :
                        'bg-red-50 dark:bg-red-900/20 border-l-red-500'
                    }`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`size-10 sm:size-12 rounded-full flex items-center justify-center shrink-0 ${
                                    result.urgency === 'low' ? 'bg-green-100' :
                                    result.urgency === 'medium' ? 'bg-yellow-100' :
                                    result.urgency === 'high' ? 'bg-orange-100' : 'bg-red-100'
                                }`}>
                                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                                        {result.urgency === 'low' ? 'check_circle' : 
                                         result.urgency === 'medium' ? 'info' :
                                         result.urgency === 'high' ? 'warning' : 'error'}
                                    </span>
                                </div>
                                <span className={`${getStatusColor(result.urgency)} text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full uppercase`}>
                                    {result.urgency}
                                </span>
                            </div>
                            <SpeakButton text={result.hindiReason} />
                        </div>
                        
                        {/* AI Recommendation */}
                        <h4 className="text-sm sm:text-lg font-bold mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg sm:text-xl">psychology</span>
                            AI Advice ({result.confidence}% confident)
                        </h4>
                        
                        {/* Main Advice */}
                        <p className="text-lg sm:text-2xl font-black mb-2 sm:mb-3 capitalize">
                            {result.action === 'stop' ? '🛑 Stop irrigation' :
                             result.action === 'irrigate' ? `💧 Irrigate ${result.waterAmount}mm` :
                             result.action === 'wait' ? '⏳ Wait - Rain expected' :
                             '⚠️ Reduce irrigation'}
                        </p>
                        
                        {result.waterAmount > 0 && (
                            <div className="bg-primary/20 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-2 sm:mb-3 inline-block">
                                <p className="text-base sm:text-xl font-bold text-primary">{result.waterAmount}mm paani</p>
                            </div>
                        )}
                        
                        {/* Explanation */}
                        <div className="bg-black/5 dark:bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-2">
                            <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Reason:</p>
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">{result.hindiReason}</p>
                        </div>
                    </section>
                )}
            </main>

            {/* ========== STICKY CHECK BUTTON - Mobile ========== */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 sm:p-4 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-area-bottom">
                <button
                    onClick={handleCheck}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white h-14 sm:h-16 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-2 sm:gap-3 shadow-xl active:scale-95 transition-all touch-manipulation"
                >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">agriculture</span>
                    Check Irrigation
                </button>
                <p className="text-[10px] sm:text-xs text-center text-gray-500 mt-1.5 sm:mt-2">Works offline ✓</p>
            </div>
        </div>
    );
};

export default OfflineFallback;
