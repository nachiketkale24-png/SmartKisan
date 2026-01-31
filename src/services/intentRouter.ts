// Intent Router for Voice Commands
// Handles Hindi/Hinglish voice commands and routes to appropriate actions

export type IntentType = 
  | 'SHOW_SCHEMES'
  | 'SHOW_PRICES'
  | 'CHECK_ELIGIBILITY'
  | 'CROP_PRICE'
  | 'SHOW_DASHBOARD'
  | 'SHOW_IRRIGATION'
  | 'SHOW_HEALTH'
  | 'SHOW_ALERTS'
  | 'UNKNOWN';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  parameters: {
    crop?: string;
    schemeId?: string;
  };
  navigateTo?: string;
  action?: string;
}

// Command patterns for intent matching
const intentPatterns: { [key in IntentType]: string[] } = {
  SHOW_SCHEMES: [
    'scheme dikhao',
    'scheme batao',
    'sarkari yojana',
    'सरकारी योजना',
    'योजना दिखाओ',
    'government scheme',
    'yojana dikhao',
    'scheme show karo',
    'schemes',
    'yojana',
  ],
  SHOW_PRICES: [
    'bhav batao',
    'bhav dikhao',
    'mandi bhav',
    'मंडी भाव',
    'भाव बताओ',
    'market price',
    'sabzi mandi',
    'aaj ka bhav',
    'rate batao',
    'price dikhao',
    'prices',
  ],
  CHECK_ELIGIBILITY: [
    'eligible hoon kya',
    'eligibility check',
    'पात्र हूं क्या',
    'eligibility batao',
    'kya main eligible hoon',
    'scheme ke liye eligible',
    'patr hai kya',
    'check karo eligible',
  ],
  CROP_PRICE: [
    'gehu ka bhav',
    'chawal ka bhav',
    'kapas ka bhav',
    'pyaj ka bhav',
    'tamatar ka bhav',
    'गेहूं का भाव',
    'चावल का भाव',
    'कपास का भाव',
    'प्याज का भाव',
    'टमाटर का भाव',
    'wheat price',
    'rice price',
    'cotton price',
    'onion price',
    'tomato price',
    'ganna ka bhav',
  ],
  SHOW_DASHBOARD: [
    'dashboard dikhao',
    'home jao',
    'ghar jao',
    'main screen',
    'डैशबोर्ड',
  ],
  SHOW_IRRIGATION: [
    'sinchai dikhao',
    'irrigation',
    'paani',
    'सिंचाई',
    'water recommendation',
  ],
  SHOW_HEALTH: [
    'health dikhao',
    'crop health',
    'fasal health',
    'rog dikhao',
    'disease',
    'फसल स्वास्थ्य',
  ],
  SHOW_ALERTS: [
    'alert dikhao',
    'notification',
    'alerts',
    'chetavni',
    'चेतावनी',
  ],
  UNKNOWN: [],
};

// Crop name mappings
const cropNameMappings: { [key: string]: string } = {
  'gehu': 'Wheat',
  'gehun': 'Wheat',
  'गेहूं': 'Wheat',
  'wheat': 'Wheat',
  'chawal': 'Rice',
  'चावल': 'Rice',
  'rice': 'Rice',
  'kapas': 'Cotton',
  'कपास': 'Cotton',
  'cotton': 'Cotton',
  'pyaj': 'Onion',
  'pyaz': 'Onion',
  'प्याज': 'Onion',
  'onion': 'Onion',
  'tamatar': 'Tomato',
  'टमाटर': 'Tomato',
  'tomato': 'Tomato',
  'ganna': 'Sugarcane',
  'गन्ना': 'Sugarcane',
  'sugarcane': 'Sugarcane',
};

// Navigation route mappings
const intentToRoute: { [key in IntentType]?: string } = {
  SHOW_SCHEMES: 'GovernmentSchemes',
  SHOW_PRICES: 'MarketPrices',
  SHOW_DASHBOARD: 'MainTabs',
  SHOW_IRRIGATION: 'Irrigation',
  SHOW_HEALTH: 'HealthHome',
  SHOW_ALERTS: 'Alerts',
};

/**
 * Normalize text for comparison
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[।,?!.]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Extract crop name from command
 */
const extractCropName = (command: string): string | undefined => {
  const normalized = normalizeText(command);
  
  for (const [key, value] of Object.entries(cropNameMappings)) {
    if (normalized.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return undefined;
};

/**
 * Calculate similarity between two strings
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Word overlap
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w));
  const overlap = commonWords.length / Math.max(words1.length, words2.length);
  
  return overlap * 0.6;
};

/**
 * Parse voice command and determine intent
 */
export const parseVoiceCommand = (command: string): IntentResult => {
  const normalized = normalizeText(command);
  let bestMatch: IntentResult = {
    intent: 'UNKNOWN',
    confidence: 0,
    parameters: {},
  };
  
  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      const similarity = calculateSimilarity(normalized, pattern);
      
      if (similarity > bestMatch.confidence) {
        bestMatch = {
          intent: intent as IntentType,
          confidence: similarity,
          parameters: {},
          navigateTo: intentToRoute[intent as IntentType],
        };
      }
    }
  }
  
  // Extract crop name if relevant
  if (bestMatch.intent === 'CROP_PRICE' || bestMatch.confidence > 0.3) {
    const crop = extractCropName(command);
    if (crop) {
      bestMatch.parameters.crop = crop;
      
      // If crop found, likely a price query
      if (bestMatch.intent === 'UNKNOWN' || bestMatch.confidence < 0.5) {
        bestMatch.intent = 'CROP_PRICE';
        bestMatch.confidence = 0.7;
        bestMatch.navigateTo = 'MarketPrices';
      }
    }
  }
  
  // Set action for special intents
  if (bestMatch.intent === 'CHECK_ELIGIBILITY') {
    bestMatch.action = 'CHECK_ELIGIBILITY';
    bestMatch.navigateTo = 'GovernmentSchemes';
  }
  
  return bestMatch;
};

/**
 * Get response message for intent
 */
export const getIntentResponse = (result: IntentResult, language: 'en' | 'hi' = 'hi'): string => {
  const responses: { [key in IntentType]: { en: string; hi: string } } = {
    SHOW_SCHEMES: {
      en: 'Opening Government Schemes page',
      hi: 'सरकारी योजनाएं पेज खोल रहा हूं',
    },
    SHOW_PRICES: {
      en: 'Opening Market Prices page',
      hi: 'मंडी भाव पेज खोल रहा हूं',
    },
    CHECK_ELIGIBILITY: {
      en: 'Opening eligibility checker',
      hi: 'पात्रता जांच खोल रहा हूं',
    },
    CROP_PRICE: {
      en: result.parameters.crop 
        ? `Opening ${result.parameters.crop} prices`
        : 'Opening Market Prices',
      hi: result.parameters.crop
        ? `${result.parameters.crop} के भाव खोल रहा हूं`
        : 'मंडी भाव खोल रहा हूं',
    },
    SHOW_DASHBOARD: {
      en: 'Going to Dashboard',
      hi: 'डैशबोर्ड पर जा रहा हूं',
    },
    SHOW_IRRIGATION: {
      en: 'Opening Irrigation page',
      hi: 'सिंचाई पेज खोल रहा हूं',
    },
    SHOW_HEALTH: {
      en: 'Opening Crop Health page',
      hi: 'फसल स्वास्थ्य पेज खोल रहा हूं',
    },
    SHOW_ALERTS: {
      en: 'Opening Alerts',
      hi: 'अलर्ट खोल रहा हूं',
    },
    UNKNOWN: {
      en: 'Sorry, I did not understand. Please try again.',
      hi: 'माफ़ कीजिए, मुझे समझ नहीं आया। कृपया फिर से बोलें।',
    },
  };
  
  return responses[result.intent][language];
};

/**
 * Process voice command and return navigation action
 */
export const processVoiceCommand = (command: string): {
  result: IntentResult;
  response: string;
  shouldNavigate: boolean;
} => {
  const result = parseVoiceCommand(command);
  const response = getIntentResponse(result, 'hi');
  const shouldNavigate = result.confidence >= 0.5 && result.navigateTo !== undefined;
  
  return {
    result,
    response,
    shouldNavigate,
  };
};

export default {
  parseVoiceCommand,
  getIntentResponse,
  processVoiceCommand,
};
