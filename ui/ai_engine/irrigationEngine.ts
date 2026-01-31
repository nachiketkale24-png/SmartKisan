/**
 * AgriGuard Offline AI Engine - Irrigation Decision Engine
 * Hybrid: Rule-based Expert System + Lightweight Decision Logic
 * 
 * Uses:
 * - ETc = Kc × ETo (FAO-56 method)
 * - MAD (Maximum Allowable Depletion)
 * - Field Capacity thresholds
 * 
 * Responds in Hinglish
 */

import {
  CROP_DATABASE,
  SOIL_DATABASE,
  MONTHLY_ETO,
  getCurrentStage,
  CropType,
  SoilType,
  CropStageData
} from './cropData';

// ============================================
// TYPES
// ============================================

export interface IrrigationInput {
  soilMoisture: number;      // Current soil moisture %
  temperature: number;       // Current temperature °C
  cropType: CropType;
  daysAfterSowing: number;
  soilType: SoilType;
  cachedWeather?: {
    rainExpected: boolean;
    rainAmount?: number;     // mm
    humidity?: number;       // %
  };
  lastIrrigationDays?: number; // Days since last irrigation
}

export interface IrrigationOutput {
  irrigationRequired: boolean;
  waterAmount: number;       // mm
  urgency: 'critical' | 'recommended' | 'optional' | 'not_needed';
  reason: {
    en: string;
    hi: string;
    hinglish: string;
  };
  details: {
    currentMoisture: number;
    optimalRange: { min: number; max: number };
    depletionLevel: number;  // %
    etc: number;             // mm/day
    stageInfo: string;
  };
  savings?: {
    waterSaved: number;      // Liters (if skipping)
    reason: string;
  };
}

// ============================================
// CONSTANTS
// ============================================

const LITERS_PER_MM_PER_HECTARE = 10000; // 1mm rain = 10,000 L/ha
const DEFAULT_FIELD_AREA = 1; // hectare for calculations

// ============================================
// MAIN IRRIGATION ENGINE
// ============================================

export function calculateIrrigation(input: IrrigationInput): IrrigationOutput {
  const crop = CROP_DATABASE[input.cropType];
  const soil = SOIL_DATABASE[input.soilType];
  const stage = getCurrentStage(input.cropType, input.daysAfterSowing);
  
  if (!crop || !soil || !stage) {
    return getErrorResponse('Invalid crop or soil type');
  }

  // Calculate key parameters
  const currentMonth = new Date().getMonth() + 1;
  const eto = MONTHLY_ETO[currentMonth] || 4.5;
  const etc = stage.kc * eto; // Crop evapotranspiration mm/day
  
  // Calculate soil water status
  const availableWater = soil.fieldCapacity - soil.wiltingPoint;
  const currentDepletion = ((soil.fieldCapacity - input.soilMoisture) / availableWater) * 100;
  const madThreshold = stage.mad;
  
  // Decision Logic (Hybrid Rules + Thresholds)
  const decision = makeIrrigationDecision({
    soilMoisture: input.soilMoisture,
    currentDepletion,
    madThreshold,
    etc,
    crop,
    stage,
    soil,
    temperature: input.temperature,
    cachedWeather: input.cachedWeather,
    lastIrrigationDays: input.lastIrrigationDays
  });

  return decision;
}

// ============================================
// DECISION LOGIC (HYBRID RULES)
// ============================================

interface DecisionParams {
  soilMoisture: number;
  currentDepletion: number;
  madThreshold: number;
  etc: number;
  crop: typeof CROP_DATABASE.wheat;
  stage: CropStageData;
  soil: typeof SOIL_DATABASE.loamy;
  temperature: number;
  cachedWeather?: IrrigationInput['cachedWeather'];
  lastIrrigationDays?: number;
}

function makeIrrigationDecision(params: DecisionParams): IrrigationOutput {
  const {
    soilMoisture,
    currentDepletion,
    madThreshold,
    etc,
    crop,
    stage,
    soil,
    temperature,
    cachedWeather,
    lastIrrigationDays
  } = params;

  // Base output structure
  const baseDetails = {
    currentMoisture: soilMoisture,
    optimalRange: crop.optimalMoisture,
    depletionLevel: Math.round(currentDepletion),
    etc: Math.round(etc * 10) / 10,
    stageInfo: `${stage.description.hi} (${stage.description.en})`
  };

  // ===== RULE 1: Rain Check =====
  if (cachedWeather?.rainExpected && (cachedWeather.rainAmount || 0) > 5) {
    const rainAmount = cachedWeather.rainAmount || 10;
    return {
      irrigationRequired: false,
      waterAmount: 0,
      urgency: 'not_needed',
      reason: {
        en: `Rain expected (${rainAmount}mm). Skip irrigation to save water.`,
        hi: `बारिश की संभावना है (${rainAmount}मिमी)। पानी बचाने के लिए सिंचाई न करें।`,
        hinglish: `Baarish aane wali hai (${rainAmount}mm). Paani bachane ke liye aaj sinchai mat karein.`
      },
      details: baseDetails,
      savings: {
        waterSaved: Math.round(etc * LITERS_PER_MM_PER_HECTARE * DEFAULT_FIELD_AREA),
        reason: 'Rain will provide natural irrigation'
      }
    };
  }

  // ===== RULE 2: Critical Moisture (Emergency) =====
  if (soilMoisture < crop.criticalMoisture) {
    const waterNeeded = calculateWaterNeeded(soil.fieldCapacity, soilMoisture, stage.rootDepth);
    return {
      irrigationRequired: true,
      waterAmount: waterNeeded,
      urgency: 'critical',
      reason: {
        en: `CRITICAL! Soil moisture ${soilMoisture}% is below critical level ${crop.criticalMoisture}%. Irrigate immediately!`,
        hi: `गंभीर! मिट्टी की नमी ${soilMoisture}% है जो ${crop.criticalMoisture}% से कम है। तुरंत सिंचाई करें!`,
        hinglish: `URGENT! Soil moisture ${soilMoisture}% hai jo critical level ${crop.criticalMoisture}% se kam hai. Abhi sinchai karein!`
      },
      details: baseDetails
    };
  }

  // ===== RULE 3: Waterlogging Risk =====
  if (soilMoisture > crop.waterlogThreshold) {
    return {
      irrigationRequired: false,
      waterAmount: 0,
      urgency: 'not_needed',
      reason: {
        en: `Moisture ${soilMoisture}% is high. Risk of waterlogging. Do not irrigate.`,
        hi: `नमी ${soilMoisture}% ज्यादा है। जलभराव का खतरा। सिंचाई न करें।`,
        hinglish: `Moisture ${soilMoisture}% zyada hai. Waterlogging ka risk hai. Sinchai mat karein.`
      },
      details: baseDetails,
      savings: {
        waterSaved: Math.round(etc * LITERS_PER_MM_PER_HECTARE * DEFAULT_FIELD_AREA),
        reason: 'Excess moisture - avoid waterlogging'
      }
    };
  }

  // ===== RULE 4: Optimal Range Check =====
  if (soilMoisture >= crop.optimalMoisture.min && soilMoisture <= crop.optimalMoisture.max) {
    return {
      irrigationRequired: false,
      waterAmount: 0,
      urgency: 'not_needed',
      reason: {
        en: `Soil moisture ${soilMoisture}% is in optimal range (${crop.optimalMoisture.min}-${crop.optimalMoisture.max}%). No irrigation needed.`,
        hi: `मिट्टी की नमी ${soilMoisture}% सही रेंज में है (${crop.optimalMoisture.min}-${crop.optimalMoisture.max}%)। सिंचाई की जरूरत नहीं।`,
        hinglish: `Soil moisture ${soilMoisture}% optimal hai (${crop.optimalMoisture.min}-${crop.optimalMoisture.max}%). Aaj sinchai ki zaroorat nahi.`
      },
      details: baseDetails,
      savings: {
        waterSaved: Math.round(etc * LITERS_PER_MM_PER_HECTARE * DEFAULT_FIELD_AREA),
        reason: 'Moisture is adequate'
      }
    };
  }

  // ===== RULE 5: MAD Threshold Check =====
  if (currentDepletion >= madThreshold) {
    const waterNeeded = calculateWaterNeeded(soil.fieldCapacity, soilMoisture, stage.rootDepth);
    return {
      irrigationRequired: true,
      waterAmount: waterNeeded,
      urgency: 'recommended',
      reason: {
        en: `Depletion ${Math.round(currentDepletion)}% has crossed MAD threshold ${madThreshold}%. Irrigation recommended.`,
        hi: `नमी घटाव ${Math.round(currentDepletion)}% MAD सीमा ${madThreshold}% से ज्यादा है। सिंचाई की सलाह।`,
        hinglish: `Moisture depletion ${Math.round(currentDepletion)}% ho gayi hai. ${waterNeeded}mm paani dein.`
      },
      details: baseDetails
    };
  }

  // ===== RULE 6: Temperature Stress =====
  if (temperature > crop.temperatureRange.max) {
    const waterNeeded = Math.round(etc * 1.2); // 20% extra for heat stress
    return {
      irrigationRequired: true,
      waterAmount: waterNeeded,
      urgency: 'recommended',
      reason: {
        en: `High temperature ${temperature}°C. Light irrigation recommended to reduce heat stress.`,
        hi: `तापमान ${temperature}°C ज्यादा है। गर्मी से बचाव के लिए हल्की सिंचाई करें।`,
        hinglish: `Temperature ${temperature}°C bahut zyada hai. Heat stress se bachne ke liye halki sinchai karein.`
      },
      details: baseDetails
    };
  }

  // ===== RULE 7: Below Optimal but Not Critical =====
  if (soilMoisture < crop.optimalMoisture.min) {
    const waterNeeded = calculateWaterNeeded(crop.optimalMoisture.min + 5, soilMoisture, stage.rootDepth);
    return {
      irrigationRequired: true,
      waterAmount: waterNeeded,
      urgency: 'optional',
      reason: {
        en: `Moisture ${soilMoisture}% is below optimal ${crop.optimalMoisture.min}%. Consider irrigating.`,
        hi: `नमी ${soilMoisture}% कम है। सिंचाई पर विचार करें।`,
        hinglish: `Moisture ${soilMoisture}% thoda kam hai. Sinchai kar sakte hain.`
      },
      details: baseDetails
    };
  }

  // ===== DEFAULT: No Action Needed =====
  return {
    irrigationRequired: false,
    waterAmount: 0,
    urgency: 'not_needed',
    reason: {
      en: `Conditions are normal. No immediate irrigation required.`,
      hi: `स्थिति सामान्य है। अभी सिंचाई की जरूरत नहीं।`,
      hinglish: `Sab theek hai. Abhi sinchai ki zaroorat nahi.`
    },
    details: baseDetails
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateWaterNeeded(
  targetMoisture: number,
  currentMoisture: number,
  rootDepth: number
): number {
  // Water needed = (target - current) × root depth × soil factor
  const moistureDeficit = targetMoisture - currentMoisture;
  const waterNeeded = (moistureDeficit / 100) * rootDepth * 10; // Convert to mm
  return Math.round(Math.max(waterNeeded, 10)); // Minimum 10mm
}

function getErrorResponse(message: string): IrrigationOutput {
  return {
    irrigationRequired: false,
    waterAmount: 0,
    urgency: 'not_needed',
    reason: {
      en: `Error: ${message}`,
      hi: `त्रुटि: ${message}`,
      hinglish: `Error: ${message}`
    },
    details: {
      currentMoisture: 0,
      optimalRange: { min: 0, max: 0 },
      depletionLevel: 0,
      etc: 0,
      stageInfo: 'Unknown'
    }
  };
}

// ============================================
// QUICK DECISION (For Voice Commands)
// ============================================

export function getQuickIrrigationAdvice(
  soilMoisture: number,
  cropType: CropType = 'wheat'
): string {
  const crop = CROP_DATABASE[cropType];
  if (!crop) return "Fasal ka type galat hai.";

  if (soilMoisture < crop.criticalMoisture) {
    return `🚨 URGENT: Soil moisture ${soilMoisture}% bahut kam hai! Abhi sinchai karein.`;
  }
  
  if (soilMoisture >= crop.optimalMoisture.min && soilMoisture <= crop.optimalMoisture.max) {
    return `✅ Moisture ${soilMoisture}% sahi hai. Aaj sinchai ki zaroorat nahi.`;
  }
  
  if (soilMoisture > crop.waterlogThreshold) {
    return `⚠️ Moisture ${soilMoisture}% zyada hai. Sinchai mat karein, waterlogging ho sakti hai.`;
  }
  
  if (soilMoisture < crop.optimalMoisture.min) {
    return `💧 Moisture ${soilMoisture}% thoda kam hai. Kal sinchai kar sakte hain.`;
  }
  
  return `Moisture ${soilMoisture}% hai. Normal condition hai.`;
}

// ============================================
// WATER SAVING CALCULATOR
// ============================================

export function calculateWaterSavings(
  skippedIrrigations: number,
  avgWaterPerIrrigation: number = 50 // mm default
): { liters: number; cost: number; message: string } {
  const liters = skippedIrrigations * avgWaterPerIrrigation * LITERS_PER_MM_PER_HECTARE * DEFAULT_FIELD_AREA;
  const costPerLiter = 0.05; // ₹0.05 per liter (pump cost)
  const cost = liters * costPerLiter;
  
  return {
    liters,
    cost: Math.round(cost),
    message: `Aapne ${skippedIrrigations} sinchai skip karke ${Math.round(liters / 1000)} hazaar litre paani bachaya! Lagbhag ₹${Math.round(cost)} ki bachat.`
  };
}
