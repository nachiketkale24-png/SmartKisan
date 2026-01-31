
import React, { useState, useEffect } from 'react';
import SpeakButton from './SpeakButton';

// ============================================
// FERTILIZER RECOMMENDATION PANEL
// Offline-capable fertilizer advisor with explainable AI
// ============================================

interface FertilizerRecommendation {
  type: string;
  quantity: string;
  reason: string;
  icon: string;
}

const CROP_OPTIONS = [
  { id: 'wheat', label: 'Wheat / Gehun', icon: 'grain' },
  { id: 'rice', label: 'Rice / Chawal', icon: 'water_drop' },
  { id: 'cotton', label: 'Cotton / Kapas', icon: 'checkroom' },
  { id: 'sugarcane', label: 'Sugarcane / Ganna', icon: 'forest' },
  { id: 'maize', label: 'Maize / Makka', icon: 'grass' }
];

const GROWTH_STAGES = [
  { id: 'seedling', label: 'Seedling / Paudha', icon: 'spa' },
  { id: 'vegetative', label: 'Vegetative / Badhna', icon: 'eco' },
  { id: 'flowering', label: 'Flowering / Phool', icon: 'local_florist' },
  { id: 'fruiting', label: 'Fruiting / Phal', icon: 'nutrition' }
];

// Mock AI logic for fertilizer recommendations
const getFertilizerRecommendation = (crop: string, stage: string): FertilizerRecommendation => {
  const recommendations: Record<string, Record<string, FertilizerRecommendation>> = {
    wheat: {
      seedling: { type: 'DAP (Di-ammonium Phosphate)', quantity: '50 kg/acre', reason: 'Phosphorus se root growth badhti hai', icon: 'science' },
      vegetative: { type: 'Urea', quantity: '40 kg/acre', reason: 'Nitrogen se patti aur tana badhe', icon: 'science' },
      flowering: { type: 'Potash (MOP)', quantity: '25 kg/acre', reason: 'Flower aur grain filling ke liye', icon: 'science' },
      fruiting: { type: 'No fertilizer needed', quantity: '0 kg', reason: 'Is stage mein fertilizer nahi chahiye', icon: 'block' }
    },
    rice: {
      seedling: { type: 'DAP', quantity: '60 kg/acre', reason: 'Early root development ke liye', icon: 'science' },
      vegetative: { type: 'Urea', quantity: '50 kg/acre', reason: 'Tiller formation ke liye nitrogen', icon: 'science' },
      flowering: { type: 'Potash + Zinc', quantity: '30 kg/acre', reason: 'Panicle development mein madad', icon: 'science' },
      fruiting: { type: 'No fertilizer', quantity: '0 kg', reason: 'Harvest se pehle band karein', icon: 'block' }
    },
    cotton: {
      seedling: { type: 'DAP', quantity: '40 kg/acre', reason: 'Initial growth boost', icon: 'science' },
      vegetative: { type: 'Urea + Zinc Sulphate', quantity: '45 kg/acre', reason: 'Strong plant structure', icon: 'science' },
      flowering: { type: 'NPK 10:26:26', quantity: '35 kg/acre', reason: 'Flowering support', icon: 'science' },
      fruiting: { type: 'Potash', quantity: '20 kg/acre', reason: 'Boll development', icon: 'science' }
    },
    sugarcane: {
      seedling: { type: 'DAP + Urea mix', quantity: '70 kg/acre', reason: 'Germination support', icon: 'science' },
      vegetative: { type: 'Urea', quantity: '80 kg/acre', reason: 'Tillering phase', icon: 'science' },
      flowering: { type: 'Potash', quantity: '40 kg/acre', reason: 'Sucrose accumulation', icon: 'science' },
      fruiting: { type: 'No fertilizer', quantity: '0 kg', reason: 'Maturity phase', icon: 'block' }
    },
    maize: {
      seedling: { type: 'DAP', quantity: '55 kg/acre', reason: 'Root establishment', icon: 'science' },
      vegetative: { type: 'Urea', quantity: '60 kg/acre', reason: 'Leaf development', icon: 'science' },
      flowering: { type: 'NPK 12:32:16', quantity: '40 kg/acre', reason: 'Tasseling support', icon: 'science' },
      fruiting: { type: 'Potash', quantity: '25 kg/acre', reason: 'Grain filling', icon: 'science' }
    }
  };

  return recommendations[crop]?.[stage] || { type: 'Consult expert', quantity: '-', reason: 'Custom recommendation needed', icon: 'help' };
};

const FertilizerPanel: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [selectedStage, setSelectedStage] = useState('vegetative');
  const [recommendation, setRecommendation] = useState<FertilizerRecommendation | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const rec = getFertilizerRecommendation(selectedCrop, selectedStage);
    setRecommendation(rec);
  }, [selectedCrop, selectedStage]);

  const speakText = recommendation 
    ? `${CROP_OPTIONS.find(c => c.id === selectedCrop)?.label} ke liye ${GROWTH_STAGES.find(s => s.id === selectedStage)?.label} stage mein ${recommendation.type} use karein. Quantity: ${recommendation.quantity}. ${recommendation.reason}.`
    : '';

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a2e1a] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-100 dark:border-amber-800 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">compost</span>
            </div>
            <div>
              <h3 className="text-sm font-bold">Fertilizer Advisor</h3>
              <p className="text-xs text-gray-500">Khad ki salah</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-400">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Crop Type Selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Select Crop / Fasal Chunein:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CROP_OPTIONS.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                    selectedCrop === crop.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                      : 'border-transparent bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${selectedCrop === crop.id ? 'text-amber-600' : 'text-gray-400'}`}>
                    {crop.icon}
                  </span>
                  <span className="text-sm font-semibold whitespace-nowrap">{crop.label.split(' / ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Growth Stage Selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Growth Stage / Badhaav ki Sthiti:</p>
            <div className="grid grid-cols-2 gap-2">
              {GROWTH_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    selectedStage === stage.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                      : 'border-transparent bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] ${selectedStage === stage.id ? 'text-green-600' : 'text-gray-400'}`}>
                    {stage.icon}
                  </span>
                  <span className="text-sm font-semibold">{stage.label.split(' / ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recommendation Output */}
          {recommendation && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">{recommendation.icon}</span>
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide">Recommendation</p>
                </div>
                <SpeakButton text={speakText} size="sm" />
              </div>
              
              <h4 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
                {recommendation.type}
              </h4>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-gray-500 text-[18px]">weight</span>
                  <span className="text-sm font-semibold">{recommendation.quantity}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
                <p><span className="font-semibold">Reason:</span> {recommendation.reason}</p>
              </div>
            </div>
          )}

          {/* Offline Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="material-symbols-outlined text-[14px]">cloud_off</span>
            <span>Offline AI Mode - Local recommendations</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerPanel;
