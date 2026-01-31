/**
 * AgriGuard Offline AI Engine - Fertilizer Recommendation Engine
 * Based on ICAR India Guidelines
 * 
 * Responds in Hinglish
 */

import {
  CROP_DATABASE,
  FERTILIZER_SCHEDULES,
  SOIL_DATABASE,
  getCurrentStage,
  getNextFertilizerSchedule,
  CropType,
  SoilType,
  GrowthStage
} from './cropData';

// ============================================
// TYPES
// ============================================

export interface FertilizerInput {
  cropType: CropType;
  daysAfterSowing: number;
  soilType: SoilType;
  lastFertilizerDays?: number;
  soilNitrogen?: 'low' | 'medium' | 'high';
  soilPhosphorus?: 'low' | 'medium' | 'high';
  soilPotassium?: 'low' | 'medium' | 'high';
}

export interface FertilizerOutput {
  fertilizeNow: boolean;
  urgency: 'immediate' | 'upcoming' | 'not_needed';
  recommendation: {
    nitrogen: number;      // kg/ha
    phosphorus: number;    // kg/ha
    potassium: number;     // kg/ha
    ureaAmount: number;    // kg/ha (practical)
    dapAmount: number;     // kg/ha
    mopAmount: number;     // kg/ha
  };
  timing: {
    en: string;
    hi: string;
    hinglish: string;
  };
  application: {
    en: string;
    hi: string;
    hinglish: string;
  };
  tips: {
    en: string;
    hi: string;
    hinglish: string;
  };
  nextSchedule?: {
    daysFromNow: number;
    stage: string;
  };
}

// ============================================
// FERTILIZER CONVERSION FACTORS
// ============================================

const UREA_N_CONTENT = 0.46;      // 46% N
const DAP_N_CONTENT = 0.18;       // 18% N
const DAP_P_CONTENT = 0.46;       // 46% P2O5
const MOP_K_CONTENT = 0.60;       // 60% K2O

// ============================================
// MAIN FERTILIZER ENGINE
// ============================================

export function calculateFertilizer(input: FertilizerInput): FertilizerOutput {
  const crop = CROP_DATABASE[input.cropType];
  const soil = SOIL_DATABASE[input.soilType];
  const schedules = FERTILIZER_SCHEDULES[input.cropType];
  const currentStage = getCurrentStage(input.cropType, input.daysAfterSowing);

  if (!crop || !soil || !schedules || !currentStage) {
    return getErrorResponse();
  }

  // Find current or upcoming fertilizer schedule
  const currentSchedule = findCurrentSchedule(schedules, input.daysAfterSowing);
  const nextSchedule = getNextFertilizerSchedule(input.cropType, input.daysAfterSowing + 1);

  if (!currentSchedule) {
    return getNoFertilizerResponse(input, nextSchedule);
  }

  // Check if we're within application window (±5 days)
  const daysDiff = input.daysAfterSowing - currentSchedule.daysAfterSowing;
  const isInWindow = daysDiff >= -5 && daysDiff <= 10;

  if (!isInWindow) {
    return getNoFertilizerResponse(input, nextSchedule);
  }

  // Calculate adjusted amounts based on soil type and nutrient status
  const adjustedAmounts = adjustForSoilConditions(
    currentSchedule,
    input.soilType,
    input.soilNitrogen,
    input.soilPhosphorus,
    input.soilPotassium
  );

  // Convert to practical fertilizer amounts
  const practicalAmounts = convertToPractical(adjustedAmounts);

  // Determine urgency
  let urgency: 'immediate' | 'upcoming' | 'not_needed' = 'upcoming';
  if (daysDiff >= 0 && daysDiff <= 3) {
    urgency = 'immediate';
  } else if (daysDiff < 0) {
    urgency = 'upcoming';
  }

  return {
    fertilizeNow: urgency === 'immediate',
    urgency,
    recommendation: {
      ...adjustedAmounts,
      ...practicalAmounts
    },
    timing: {
      en: currentSchedule.application.en,
      hi: currentSchedule.application.hi,
      hinglish: generateTimingHinglish(currentSchedule, daysDiff)
    },
    application: {
      en: getApplicationMethod(input.cropType, currentStage.stage),
      hi: getApplicationMethodHi(input.cropType, currentStage.stage),
      hinglish: getApplicationMethodHinglish(input.cropType, currentStage.stage)
    },
    tips: {
      en: currentSchedule.tips.en,
      hi: currentSchedule.tips.hi,
      hinglish: generateTipsHinglish(currentSchedule, input.soilType)
    },
    nextSchedule: nextSchedule ? {
      daysFromNow: nextSchedule.daysAfterSowing - input.daysAfterSowing,
      stage: nextSchedule.stage
    } : undefined
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function findCurrentSchedule(
  schedules: typeof FERTILIZER_SCHEDULES.wheat,
  daysAfterSowing: number
) {
  // Find schedule within ±10 days window
  for (const schedule of schedules) {
    const diff = daysAfterSowing - schedule.daysAfterSowing;
    if (diff >= -5 && diff <= 10) {
      return schedule;
    }
  }
  return null;
}

function adjustForSoilConditions(
  schedule: typeof FERTILIZER_SCHEDULES.wheat[0],
  soilType: SoilType,
  soilN?: 'low' | 'medium' | 'high',
  soilP?: 'low' | 'medium' | 'high',
  soilK?: 'low' | 'medium' | 'high'
): { nitrogen: number; phosphorus: number; potassium: number } {
  let nFactor = 1.0;
  let pFactor = 1.0;
  let kFactor = 1.0;

  // Adjust based on soil nutrient status
  if (soilN === 'low') nFactor = 1.25;
  else if (soilN === 'high') nFactor = 0.75;

  if (soilP === 'low') pFactor = 1.25;
  else if (soilP === 'high') pFactor = 0.75;

  if (soilK === 'low') kFactor = 1.25;
  else if (soilK === 'high') kFactor = 0.75;

  // Adjust for soil type
  if (soilType === 'sandy') {
    nFactor *= 1.1; // Sandy soil needs more N (leaching)
  } else if (soilType === 'black') {
    kFactor *= 0.9; // Black soil often rich in K
  }

  return {
    nitrogen: Math.round(schedule.nitrogen * nFactor),
    phosphorus: Math.round(schedule.phosphorus * pFactor),
    potassium: Math.round(schedule.potassium * kFactor)
  };
}

function convertToPractical(amounts: { nitrogen: number; phosphorus: number; potassium: number }) {
  // Convert nutrient amounts to practical fertilizer products
  // Using DAP for P and partial N, Urea for remaining N, MOP for K
  
  const dapForP = amounts.phosphorus > 0 ? Math.round(amounts.phosphorus / DAP_P_CONTENT) : 0;
  const nFromDap = dapForP * DAP_N_CONTENT;
  const remainingN = Math.max(0, amounts.nitrogen - nFromDap);
  const ureaNeeded = remainingN > 0 ? Math.round(remainingN / UREA_N_CONTENT) : 0;
  const mopNeeded = amounts.potassium > 0 ? Math.round(amounts.potassium / MOP_K_CONTENT) : 0;

  return {
    ureaAmount: ureaNeeded,
    dapAmount: dapForP,
    mopAmount: mopNeeded
  };
}

function generateTimingHinglish(
  schedule: typeof FERTILIZER_SCHEDULES.wheat[0],
  daysDiff: number
): string {
  if (daysDiff < 0) {
    return `${Math.abs(daysDiff)} din mein ${schedule.stage} stage par fertilizer dena hai.`;
  } else if (daysDiff === 0) {
    return `Aaj fertilizer dene ka sahi samay hai! ${schedule.stage} stage chal raha hai.`;
  } else {
    return `Fertilizer dene ka samay ho gaya hai. ${daysDiff} din pehle dena tha.`;
  }
}

function generateTipsHinglish(
  schedule: typeof FERTILIZER_SCHEDULES.wheat[0],
  soilType: SoilType
): string {
  let tips = schedule.tips.hi;
  
  if (soilType === 'sandy') {
    tips += ' Balui mitti mein paani ke saath fertilizer jaldi behh jata hai, isliye chhoti matra mein baar-baar dein.';
  } else if (soilType === 'clayey') {
    tips += ' Chikni mitti mein fertilizer dheere ghulta hai, irrigation ke baad dein.';
  }
  
  return tips;
}

function getApplicationMethod(cropType: CropType, stage: GrowthStage): string {
  if (stage === 'initial') {
    return 'Broadcast and incorporate into soil before sowing/transplanting.';
  }
  return 'Apply as top dressing along the rows, 5-7 cm away from plant base.';
}

function getApplicationMethodHi(cropType: CropType, stage: GrowthStage): string {
  if (stage === 'initial') {
    return 'बुवाई/रोपाई से पहले खेत में छिटक कर मिट्टी में मिला दें।';
  }
  return 'पौधों की कतारों के बीच, जड़ से 5-7 सेमी दूर टॉप ड्रेसिंग करें।';
}

function getApplicationMethodHinglish(cropType: CropType, stage: GrowthStage): string {
  if (stage === 'initial') {
    return 'Buwai se pehle khet mein chhitak kar mitti mein mila dein.';
  }
  return 'Paudhon ki line ke beech, jad se 5-7 cm door top dressing karein.';
}

function getNoFertilizerResponse(
  input: FertilizerInput,
  nextSchedule: typeof FERTILIZER_SCHEDULES.wheat[0] | null
): FertilizerOutput {
  const daysUntilNext = nextSchedule
    ? nextSchedule.daysAfterSowing - input.daysAfterSowing
    : 0;

  return {
    fertilizeNow: false,
    urgency: 'not_needed',
    recommendation: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      ureaAmount: 0,
      dapAmount: 0,
      mopAmount: 0
    },
    timing: {
      en: 'No fertilizer application needed at this time.',
      hi: 'अभी खाद देने की जरूरत नहीं है।',
      hinglish: 'Abhi fertilizer dene ki zaroorat nahi hai.'
    },
    application: {
      en: '',
      hi: '',
      hinglish: ''
    },
    tips: {
      en: nextSchedule ? `Next application in ${daysUntilNext} days at ${nextSchedule.stage} stage.` : 'All scheduled applications complete.',
      hi: nextSchedule ? `अगली खाद ${daysUntilNext} दिन बाद ${nextSchedule.stage} अवस्था में।` : 'सभी निर्धारित खाद दी जा चुकी है।',
      hinglish: nextSchedule ? `Agla fertilizer ${daysUntilNext} din baad ${nextSchedule.stage} stage mein dena hai.` : 'Saari scheduled fertilizer de chuke hain.'
    },
    nextSchedule: nextSchedule ? {
      daysFromNow: daysUntilNext,
      stage: nextSchedule.stage
    } : undefined
  };
}

function getErrorResponse(): FertilizerOutput {
  return {
    fertilizeNow: false,
    urgency: 'not_needed',
    recommendation: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      ureaAmount: 0,
      dapAmount: 0,
      mopAmount: 0
    },
    timing: {
      en: 'Error: Invalid input',
      hi: 'त्रुटि: गलत इनपुट',
      hinglish: 'Error: Galat input'
    },
    application: { en: '', hi: '', hinglish: '' },
    tips: { en: '', hi: '', hinglish: '' }
  };
}

// ============================================
// QUICK ADVICE (For Voice Commands)
// ============================================

export function getQuickFertilizerAdvice(
  cropType: CropType,
  daysAfterSowing: number
): string {
  const result = calculateFertilizer({
    cropType,
    daysAfterSowing,
    soilType: 'loamy'
  });

  if (result.fertilizeNow) {
    const { ureaAmount, dapAmount, mopAmount } = result.recommendation;
    let advice = `🌱 Aaj fertilizer dene ka samay hai!\n`;
    if (ureaAmount > 0) advice += `Urea: ${ureaAmount} kg/hectare\n`;
    if (dapAmount > 0) advice += `DAP: ${dapAmount} kg/hectare\n`;
    if (mopAmount > 0) advice += `MOP: ${mopAmount} kg/hectare\n`;
    advice += `\n${result.tips.hinglish}`;
    return advice;
  }

  if (result.nextSchedule) {
    return `📅 Abhi fertilizer ki zaroorat nahi. Agla fertilizer ${result.nextSchedule.daysFromNow} din baad dena hai (${result.nextSchedule.stage} stage mein).`;
  }

  return '✅ Is season ki saari fertilizer application complete ho gayi hai.';
}
