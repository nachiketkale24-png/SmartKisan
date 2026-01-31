/**
 * AgriGuard Offline AI Engine - Voice Command Router
 * Intent Detection + Response Generation
 * 
 * Supported Languages: Hinglish (Hindi + English mix)
 * 
 * Pipeline:
 * Speech Input → Text → Intent Detection → Route to Engine → Generate Response → Voice Output
 */

import { calculateIrrigation, getQuickIrrigationAdvice, IrrigationInput } from './irrigationEngine';
import { calculateFertilizer, getQuickFertilizerAdvice } from './fertilizerEngine';
import { diagnoseCropHealth, getQuickHealthAdvice, SymptomType } from './cropHealthEngine';
import { getQuickWeatherAdvice, getCurrentSeason, getWeatherData } from './weatherFallbackEngine';
import { CropType, CROP_DATABASE, getCropNames } from './cropData';

// ============================================
// TYPES
// ============================================

export type IntentType =
  | 'irrigation_check'
  | 'irrigation_amount'
  | 'fertilizer_advice'
  | 'crop_health'
  | 'weather_check'
  | 'soil_moisture'
  | 'water_saved'
  | 'crop_info'
  | 'season_info'
  | 'greeting'
  | 'help'
  | 'unknown';

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  language?: 'hi' | 'en' | 'hi-en';
}

export interface VoiceResponse {
  text: string;
  ssml?: string;        // For TTS
  intent: IntentType;
  confidence: number;
  action?: string;      // UI action to trigger
  data?: any;           // Additional data for UI
}

export interface SensorContext {
  soilMoisture?: number;
  temperature?: number;
  humidity?: number;
  cropType?: CropType;
  daysAfterSowing?: number;
  soilType?: 'sandy' | 'loamy' | 'clayey' | 'black';
  lastIrrigationDays?: number;
}

// ============================================
// INTENT PATTERNS (Hinglish + Hindi + English)
// ============================================

interface IntentPattern {
  intent: IntentType;
  patterns: RegExp[];
  keywords: string[];
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'irrigation_check',
    patterns: [
      /paani\s*(dena|doon|de|dein|lagana|lagaun)/i,
      /sinchai\s*(karu|karna|karni|karein)/i,
      /irrigation\s*(today|now|karna|karein)/i,
      /aaj\s*paani/i,
      /water\s*(dena|today|needed)/i
    ],
    keywords: ['paani', 'sinchai', 'irrigation', 'water', 'सिंचाई', 'पानी']
  },
  {
    intent: 'irrigation_amount',
    patterns: [
      /kitna\s*paani/i,
      /paani\s*kitna/i,
      /how\s*much\s*water/i,
      /water\s*amount/i,
      /sinchai\s*kitni/i
    ],
    keywords: ['kitna', 'amount', 'कितना', 'how much']
  },
  {
    intent: 'fertilizer_advice',
    patterns: [
      /fertilizer|khad|urea|dap|npk/i,
      /खाद|यूरिया|उर्वरक/,
      /khaad\s*(dena|doon|advice)/i,
      /fertilizer\s*(advice|recommendation|batao)/i
    ],
    keywords: ['fertilizer', 'khad', 'khaad', 'urea', 'dap', 'खाद', 'यूरिया']
  },
  {
    intent: 'crop_health',
    patterns: [
      /fasal\s*(ka|ki)\s*(health|haalat|condition)/i,
      /crop\s*health/i,
      /bimari|disease|rog/i,
      /patti|leaves|पत्ती/i,
      /kya\s*problem/i,
      /fasal\s*kaisi/i
    ],
    keywords: ['health', 'bimari', 'disease', 'fasal', 'crop', 'फसल', 'बीमारी', 'रोग']
  },
  {
    intent: 'weather_check',
    patterns: [
      /mausam|weather|barish|rain/i,
      /मौसम|बारिश/,
      /aaj\s*ka\s*mausam/i,
      /weather\s*(today|forecast|batao)/i,
      /baarish\s*(aayegi|hogi|expected)/i
    ],
    keywords: ['mausam', 'weather', 'barish', 'rain', 'मौसम', 'बारिश']
  },
  {
    intent: 'soil_moisture',
    patterns: [
      /soil\s*moisture/i,
      /mitti\s*(ki|ka)\s*nami/i,
      /moisture\s*(level|kitna|check)/i,
      /nami\s*(kitni|check|batao)/i
    ],
    keywords: ['moisture', 'nami', 'नमी', 'soil']
  },
  {
    intent: 'water_saved',
    patterns: [
      /paani\s*(bachaya|saved|saving)/i,
      /water\s*saved/i,
      /kitna\s*bachaya/i,
      /saving\s*report/i
    ],
    keywords: ['bachaya', 'saved', 'saving', 'बचाया']
  },
  {
    intent: 'crop_info',
    patterns: [
      /gehun|wheat|धान|rice|dhan|kapas|cotton/i,
      /fasal\s*(ki|ka)\s*(jankari|info)/i,
      /crop\s*info/i
    ],
    keywords: ['gehun', 'wheat', 'rice', 'dhan', 'kapas', 'cotton', 'गेहूं', 'धान', 'कपास']
  },
  {
    intent: 'season_info',
    patterns: [
      /season|ritu|mausam\s*ka\s*time/i,
      /rabi|kharif|zaid/i,
      /konsi\s*fasal\s*lagaun/i
    ],
    keywords: ['season', 'rabi', 'kharif', 'ritu', 'ऋतु']
  },
  {
    intent: 'greeting',
    patterns: [
      /namaste|hello|hi|hey|namaskar/i,
      /good\s*(morning|evening|afternoon)/i,
      /नमस्ते|नमस्कार/
    ],
    keywords: ['namaste', 'hello', 'hi', 'नमस्ते']
  },
  {
    intent: 'help',
    patterns: [
      /help|madad|sahayata|kya\s*kar\s*sakte/i,
      /क्या\s*कर\s*सकते/,
      /commands|options/i
    ],
    keywords: ['help', 'madad', 'मदद', 'sahayata']
  }
];

// ============================================
// INTENT DETECTION
// ============================================

export function detectIntent(command: VoiceCommand): { intent: IntentType; confidence: number } {
  const text = command.transcript.toLowerCase().trim();
  
  let bestMatch: { intent: IntentType; confidence: number } = {
    intent: 'unknown',
    confidence: 0
  };

  for (const pattern of INTENT_PATTERNS) {
    // Check regex patterns
    for (const regex of pattern.patterns) {
      if (regex.test(text)) {
        const confidence = 0.9;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent: pattern.intent, confidence };
        }
      }
    }

    // Check keywords
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        const confidence = 0.7;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent: pattern.intent, confidence };
        }
      }
    }
  }

  return bestMatch;
}

// ============================================
// CROP TYPE DETECTION FROM TEXT
// ============================================

function detectCropFromText(text: string): CropType | null {
  const cropMap: Record<string, CropType> = {
    'wheat': 'wheat',
    'gehun': 'wheat',
    'गेहूं': 'wheat',
    'rice': 'rice',
    'dhan': 'rice',
    'dhaan': 'rice',
    'chawal': 'rice',
    'धान': 'rice',
    'cotton': 'cotton',
    'kapas': 'cotton',
    'कपास': 'cotton'
  };

  const lowerText = text.toLowerCase();
  for (const [key, crop] of Object.entries(cropMap)) {
    if (lowerText.includes(key)) {
      return crop;
    }
  }
  return null;
}

// ============================================
// SYMPTOM DETECTION FROM TEXT
// ============================================

function detectSymptomsFromText(text: string): SymptomType[] {
  const symptomMap: Record<string, SymptomType> = {
    'yellow': 'yellow_leaves',
    'peela': 'yellow_leaves',
    'peeli': 'yellow_leaves',
    'पीला': 'yellow_leaves',
    'brown': 'brown_spots',
    'bhura': 'brown_spots',
    'धब्बे': 'brown_spots',
    'spots': 'brown_spots',
    'wilt': 'wilting',
    'murjha': 'wilting',
    'मुरझा': 'wilting',
    'sukh': 'wilting',
    'curl': 'curling_leaves',
    'mud': 'curling_leaves',
    'white powder': 'white_powder',
    'safed': 'white_powder',
    'powder': 'white_powder',
    'hole': 'holes_in_leaves',
    'chhed': 'holes_in_leaves',
    'छेद': 'holes_in_leaves',
    'aphid': 'aphids',
    'maahu': 'aphids',
    'chepa': 'aphids'
  };

  const lowerText = text.toLowerCase();
  const detected: SymptomType[] = [];
  
  for (const [key, symptom] of Object.entries(symptomMap)) {
    if (lowerText.includes(key) && !detected.includes(symptom)) {
      detected.push(symptom);
    }
  }
  
  return detected;
}

// ============================================
// MAIN VOICE COMMAND ROUTER
// ============================================

export function processVoiceCommand(
  command: VoiceCommand,
  context: SensorContext = {}
): VoiceResponse {
  const { intent, confidence: intentConfidence } = detectIntent(command);
  
  // Default context values
  const cropType = detectCropFromText(command.transcript) || context.cropType || 'wheat';
  const soilMoisture = context.soilMoisture ?? 45;
  const temperature = context.temperature ?? 28;
  const daysAfterSowing = context.daysAfterSowing ?? 45;
  const soilType = context.soilType || 'loamy';

  switch (intent) {
    case 'irrigation_check':
    case 'irrigation_amount':
      return handleIrrigationQuery(cropType, soilMoisture, temperature, daysAfterSowing, soilType, context);

    case 'fertilizer_advice':
      return handleFertilizerQuery(cropType, daysAfterSowing);

    case 'crop_health':
      return handleCropHealthQuery(cropType, command.transcript, context);

    case 'weather_check':
      return handleWeatherQuery();

    case 'soil_moisture':
      return handleSoilMoistureQuery(soilMoisture, cropType);

    case 'water_saved':
      return handleWaterSavedQuery();

    case 'crop_info':
      return handleCropInfoQuery(cropType);

    case 'season_info':
      return handleSeasonQuery();

    case 'greeting':
      return handleGreeting();

    case 'help':
      return handleHelp();

    default:
      return handleUnknown(command.transcript);
  }
}

// ============================================
// INTENT HANDLERS
// ============================================

function handleIrrigationQuery(
  cropType: CropType,
  soilMoisture: number,
  temperature: number,
  daysAfterSowing: number,
  soilType: 'sandy' | 'loamy' | 'clayey' | 'black',
  context: SensorContext
): VoiceResponse {
  const weather = getWeatherData();
  
  const result = calculateIrrigation({
    soilMoisture,
    temperature,
    cropType,
    daysAfterSowing,
    soilType,
    cachedWeather: {
      rainExpected: weather.rainProbability > 50,
      rainAmount: weather.rainfall,
      humidity: weather.humidity
    },
    lastIrrigationDays: context.lastIrrigationDays
  });

  let emoji = '💧';
  if (result.urgency === 'critical') emoji = '🚨';
  else if (result.urgency === 'not_needed') emoji = '✅';
  else if (result.urgency === 'optional') emoji = '💡';

  let text = `${emoji} ${result.reason.hinglish}\n\n`;
  
  if (result.irrigationRequired) {
    text += `📊 Paani ki matra: ${result.waterAmount} mm\n`;
    text += `🌱 Fasal stage: ${result.details.stageInfo}\n`;
    text += `💧 Current moisture: ${soilMoisture}% (Optimal: ${result.details.optimalRange.min}-${result.details.optimalRange.max}%)`;
  } else if (result.savings) {
    text += `\n💰 Aaj skip karke aap ${Math.round(result.savings.waterSaved / 1000)} hazaar litre paani bacha sakte hain!`;
  }

  return {
    text,
    intent: 'irrigation_check',
    confidence: 0.9,
    action: result.urgency === 'critical' ? 'SHOW_IRRIGATION_ALERT' : undefined,
    data: result
  };
}

function handleFertilizerQuery(cropType: CropType, daysAfterSowing: number): VoiceResponse {
  const advice = getQuickFertilizerAdvice(cropType, daysAfterSowing);
  
  return {
    text: advice,
    intent: 'fertilizer_advice',
    confidence: 0.85,
    action: 'SHOW_FERTILIZER_PANEL'
  };
}

function handleCropHealthQuery(cropType: CropType, transcript: string, context: SensorContext): VoiceResponse {
  const symptoms = detectSymptomsFromText(transcript);
  
  if (symptoms.length === 0) {
    return {
      text: '🌱 Fasal ki kya problem hai? Batayein:\n\n' +
            '• Patti peeli ho gayi (Yellow leaves)\n' +
            '• Dhabbe dikh rahe (Brown spots)\n' +
            '• Paudha murjha raha (Wilting)\n' +
            '• Safed powder (White powder)\n' +
            '• Patti mein chhed (Holes)\n' +
            '• Keede dikh rahe (Insects)\n\n' +
            'Apni problem batayein...',
      intent: 'crop_health',
      confidence: 0.7,
      action: 'SHOW_SYMPTOM_SELECTOR'
    };
  }

  const advice = getQuickHealthAdvice(cropType, transcript);
  
  return {
    text: advice,
    intent: 'crop_health',
    confidence: 0.85,
    action: 'SHOW_HEALTH_DETAILS'
  };
}

function handleWeatherQuery(): VoiceResponse {
  const advice = getQuickWeatherAdvice();
  
  return {
    text: advice,
    intent: 'weather_check',
    confidence: 0.9
  };
}

function handleSoilMoistureQuery(soilMoisture: number, cropType: CropType): VoiceResponse {
  const crop = CROP_DATABASE[cropType];
  const advice = getQuickIrrigationAdvice(soilMoisture, cropType);
  
  let status = 'Normal';
  let emoji = '💧';
  
  if (soilMoisture < crop.criticalMoisture) {
    status = 'Critical - bahut kam!';
    emoji = '🚨';
  } else if (soilMoisture < crop.optimalMoisture.min) {
    status = 'Thoda kam';
    emoji = '⚠️';
  } else if (soilMoisture > crop.waterlogThreshold) {
    status = 'Bahut zyada - waterlogging risk';
    emoji = '⚠️';
  } else {
    status = 'Optimal hai';
    emoji = '✅';
  }

  const text = `${emoji} Soil Moisture: ${soilMoisture}%\n` +
               `Status: ${status}\n` +
               `Optimal range: ${crop.optimalMoisture.min}-${crop.optimalMoisture.max}%\n\n` +
               advice;

  return {
    text,
    intent: 'soil_moisture',
    confidence: 0.9,
    data: { soilMoisture, status }
  };
}

function handleWaterSavedQuery(): VoiceResponse {
  // This would integrate with actual saved data
  const text = '💧 Water Saving Report:\n\n' +
               '📊 Aaj: 1,500 litre bachaya\n' +
               '📅 Is hafte: 8,200 litre\n' +
               '📆 Is mahine: 32,000 litre\n\n' +
               '💰 Lagbhag ₹1,600 ki bijli aur paani bachaya!\n\n' +
               '🌱 Smart irrigation se paani bachana environment ke liye bhi achha hai.';

  return {
    text,
    intent: 'water_saved',
    confidence: 0.85,
    action: 'SHOW_SAVINGS_REPORT'
  };
}

function handleCropInfoQuery(cropType: CropType): VoiceResponse {
  const crop = CROP_DATABASE[cropType];
  
  const text = `🌾 ${crop.name.hi} (${crop.name.en})\n\n` +
               `📅 Duration: ${crop.totalDuration} din\n` +
               `💧 Paani: ${crop.waterRequirement.total} mm total\n` +
               `🌡️ Temperature: ${crop.temperatureRange.optimal.min}-${crop.temperatureRange.optimal.max}°C best\n` +
               `💧 Optimal moisture: ${crop.optimalMoisture.min}-${crop.optimalMoisture.max}%\n\n` +
               `⚠️ Critical moisture: ${crop.criticalMoisture}% se neeche mat jaane dein`;

  return {
    text,
    intent: 'crop_info',
    confidence: 0.9,
    data: crop
  };
}

function handleSeasonQuery(): VoiceResponse {
  const season = getCurrentSeason();
  
  const text = `📅 Abhi ka season: ${season.hi} (${season.name})\n\n` +
               `💡 ${season.advice}\n\n` +
               getCropSuggestions();

  return {
    text,
    intent: 'season_info',
    confidence: 0.85
  };
}

function getCropSuggestions(): string {
  const month = new Date().getMonth() + 1;
  
  if (month >= 10 || month <= 2) {
    return '🌾 Rabi crops: Gehun (Wheat), Sarson (Mustard), Chana (Chickpea) lagayein.';
  } else if (month >= 6 && month <= 9) {
    return '🌾 Kharif crops: Dhan (Rice), Makka (Maize), Kapas (Cotton) lagayein.';
  } else {
    return '🌾 Zaid crops: Tarbuz (Watermelon), Kakdi (Cucumber), Moong dal lagayein.';
  }
}

function handleGreeting(): VoiceResponse {
  const hour = new Date().getHours();
  let greeting = 'Namaste';
  
  if (hour < 12) greeting = 'Suprabhat! Good morning';
  else if (hour < 17) greeting = 'Namaste';
  else greeting = 'Shubh sandhya! Good evening';

  const text = `🙏 ${greeting}!\n\n` +
               `Main hoon aapka AI Krishi Sahayak.\n\n` +
               `Aap mujhse pooch sakte hain:\n` +
               `• "Aaj paani dena hai kya?"\n` +
               `• "Fertilizer advice do"\n` +
               `• "Fasal ki health batao"\n` +
               `• "Mausam kaisa hai?"\n\n` +
               `Kya madad chahiye?`;

  return {
    text,
    intent: 'greeting',
    confidence: 1.0
  };
}

function handleHelp(): VoiceResponse {
  const text = '🤖 AI Krishi Sahayak - Voice Commands:\n\n' +
               '💧 IRRIGATION:\n' +
               '• "Aaj paani dena hai kya?"\n' +
               '• "Sinchai kitna karna hai?"\n' +
               '• "Paani kitna dena hai?"\n\n' +
               '🌱 FERTILIZER:\n' +
               '• "Fertilizer advice do"\n' +
               '• "Khaad kab daalni hai?"\n' +
               '• "Urea kitna daalna hai?"\n\n' +
               '🩺 CROP HEALTH:\n' +
               '• "Fasal ki health batao"\n' +
               '• "Patti peeli ho gayi"\n' +
               '• "Bimari lag gayi hai"\n\n' +
               '🌤️ WEATHER:\n' +
               '• "Aaj ka mausam batao"\n' +
               '• "Barish aayegi kya?"\n\n' +
               '💧 SOIL:\n' +
               '• "Soil moisture check karo"\n' +
               '• "Nami kitni hai?"';

  return {
    text,
    intent: 'help',
    confidence: 1.0,
    action: 'SHOW_HELP_PANEL'
  };
}

function handleUnknown(transcript: string): VoiceResponse {
  const text = `🤔 "${transcript}" samajh nahi aaya.\n\n` +
               `Kuch aisa poochein:\n` +
               `• "Aaj paani dena hai kya?"\n` +
               `• "Fertilizer advice do"\n` +
               `• "Mausam kaisa hai?"\n\n` +
               `Ya "help" bolein sabhi commands ke liye.`;

  return {
    text,
    intent: 'unknown',
    confidence: 0.3
  };
}

// ============================================
// QUICK COMMAND SUGGESTIONS (For UI)
// ============================================

export function getQuickCommands(): { text: string; hinglish: string; icon: string }[] {
  return [
    { text: 'Check irrigation', hinglish: 'Aaj paani dena hai?', icon: '💧' },
    { text: 'Fertilizer advice', hinglish: 'Khaad kab daalni hai?', icon: '🌱' },
    { text: 'Crop health', hinglish: 'Fasal kaisi hai?', icon: '🩺' },
    { text: 'Weather check', hinglish: 'Mausam kaisa hai?', icon: '🌤️' },
    { text: 'Soil moisture', hinglish: 'Nami kitni hai?', icon: '💧' },
    { text: 'Water saved', hinglish: 'Paani kitna bachaya?', icon: '💰' }
  ];
}
