// AgriGuard Intent Router - Voice/Text Command Detection
// Hybrid: Keyword Matching + Pattern Recognition (Offline-friendly)

import { Intent, IntentResult } from './types';

// ============================================
// INTENT PATTERNS - Hindi, English, Hinglish
// ============================================
const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
    ASK_TEMPERATURE: [
        /temperature|temp|taapmaan|taapman|गर्मी|गरम|ठंड|कितना गर्म|kitna garam|kitni garmi|aaj ka temp|today.*(hot|cold)|मौसम कैसा/i,
        /कितना.*(degree|डिग्री)|degree.*कितना|how hot|कितनी ठंड/i,
    ],
    ASK_HUMIDITY: [
        /humidity|नमी|hawa.*nami|moisture.*air|aardrata|आर्द्रता|हवा में नमी/i,
    ],
    ASK_SOIL_MOISTURE: [
        /soil.*moisture|mitti.*nami|मिट्टी.*नमी|नमी.*मिट्टी|check.*soil|mitti kaisi|जमीन.*नमी|bhumi nami/i,
        /moisture.*level|nami.*kitni|कितनी नमी|soil check|mitti check/i,
    ],
    ASK_WEATHER: [
        /weather|mausam|मौसम|barish|baarish|बारिश|rain|dhoop|धूप|badal|बादल|forecast/i,
        /aaj.*mausam|kal.*mausam|weather.*today|weather.*tomorrow|बारिश होगी|rain.*today/i,
    ],
    ASK_IRRIGATION: [
        /irrigat|sichai|सिंचाई|paani|पानी.*दे|water.*give|पानी डालना|sinchai|irrigation.*today/i,
        /paani.*dena|पानी देना|kitna paani|कितना पानी|should.*water|aaj paani|irrigate.*today/i,
        /water.*crop|पानी.*फसल|सींचना|seenchna|paani.*lagana|पानी लगाना/i,
    ],
    ASK_FERTILIZER: [
        /fertilizer|khad|खाद|urea|यूरिया|dap|potash|पोटाश|npk|fertiliser/i,
        /khad.*dena|खाद.*देना|fertilizer.*advice|कौनसी खाद|konsi khad|kitni khad|कितनी खाद/i,
    ],
    ASK_CROP_HEALTH: [
        /crop.*health|fasal.*kaisi|फसल कैसी|plant.*health|crop.*status|फसल.*हालत/i,
        /fasal.*theek|फसल ठीक|crop.*okay|plant.*condition|पौधे कैसे|paudhe kaise/i,
    ],
    ASK_WATER_AMOUNT: [
        /kitna.*paani|कितना.*पानी|how much.*water|water.*amount|paani.*kitna|mm.*paani/i,
        /litre|लीटर|gallon|बाल्टी|bucket|कितने.*पानी/i,
    ],
    ASK_ALERTS: [
        /alert|चेतावनी|warning|khabar|खबर|notification|problem|dikkat|दिक्कत|issue/i,
        /koi.*problem|कोई.*समस्या|any.*issue|alerts.*show|show.*alerts/i,
    ],
    // Navigation Intents
    NAV_DASHBOARD: [
        /dashboard|home|ghar|होम|घर|main.*screen|mukhya/i,
        /dashboard.*dikhao|dashboard.*kholo|go.*dashboard|open.*dashboard/i,
    ],
    NAV_IRRIGATION: [
        /irrigation.*dikhao|irrigation.*kholo|sinchai.*dikhao|सिंचाई.*दिखाओ/i,
        /open.*irrigation|go.*irrigation|pani.*screen|water.*screen/i,
        /irrigation.*page|sichai.*page/i,
    ],
    NAV_ALERTS: [
        /alerts.*dikhao|alerts.*kholo|alert.*dikhao|अलर्ट.*दिखाओ/i,
        /open.*alerts|go.*alerts|show.*alerts|notification.*dikhao/i,
        /chetawani.*dikhao|चेतावनी.*दिखाओ|warnings.*show/i,
    ],
    NAV_ASSISTANT: [
        /assistant.*kholo|assistant.*dikhao|chat.*kholo|सहायक.*खोलो/i,
        /open.*assistant|go.*assistant|madad.*kholo|मदद.*खोलो/i,
        /baat.*karo|chat.*karo|bot.*kholo/i,
    ],
    GREETING: [
        /^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|pranam|प्रणाम|jai hind)$/i,
        /good.*(morning|afternoon|evening)|suprabhat|शुभ/i,
        /kaise ho|कैसे हो|how are you|aap kaise|आप कैसे/i,
    ],
    THANKS: [
        /thank|dhanyawad|धन्यवाद|shukriya|शुक्रिया|bahut.*achha|बहुत अच्छा|great|awesome/i,
    ],
    HELP: [
        /help|madad|मदद|sahayata|सहायता|kya kar sakte|क्या कर सकते|what can you/i,
        /guide|समझाओ|batao|बताओ|explain|kaise use/i,
    ],
    UNKNOWN: [],
};

// ============================================
// ENTITY EXTRACTION - Crops, Stages, Values
// ============================================
const CROP_PATTERNS: Record<string, RegExp> = {
    wheat: /wheat|gehun|गेहूं|गेहुँ|kanak|कनक/i,
    rice: /rice|chawal|चावल|dhan|धान|paddy/i,
    cotton: /cotton|kapas|कपास|rui|रूई/i,
};

const STAGE_PATTERNS: Record<string, RegExp> = {
    sowing: /sowing|buwai|बुवाई|plantation|ropai|रोपाई/i,
    vegetative: /vegetative|growth|बढ़वार|badhwar|growing/i,
    flowering: /flowering|phool|फूल|bloom|baal|बाल/i,
    harvesting: /harvest|katai|कटाई|tudai|तुड़ाई/i,
};

const extractEntities = (text: string): IntentResult['entities'] => {
    const entities: IntentResult['entities'] = {};
    
    // Extract crop
    for (const [crop, pattern] of Object.entries(CROP_PATTERNS)) {
        if (pattern.test(text)) {
            entities.crop = crop;
            break;
        }
    }
    
    // Extract stage
    for (const [stage, pattern] of Object.entries(STAGE_PATTERNS)) {
        if (pattern.test(text)) {
            entities.stage = stage;
            break;
        }
    }
    
    // Extract numeric values
    const numberMatch = text.match(/(\d+)\s*(%|percent|mm|degree|kg|litre)/i);
    if (numberMatch) {
        entities.value = parseInt(numberMatch[1]);
    }
    
    return entities;
};

// ============================================
// MAIN INTENT DETECTION FUNCTION
// ============================================
export const detectIntent = (input: string): IntentResult => {
    const cleanInput = input.trim().toLowerCase();
    console.log('[IntentRouter] Processing input:', cleanInput);
    
    let bestIntent: Intent = 'UNKNOWN';
    let bestConfidence = 0;
    
    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [Intent, RegExp[]][]) {
        if (intent === 'UNKNOWN') continue;
        
        for (const pattern of patterns) {
            if (pattern.test(cleanInput)) {
                // Calculate confidence based on match quality
                const match = cleanInput.match(pattern);
                const confidence = match ? (match[0].length / cleanInput.length) * 100 : 0;
                
                if (confidence > bestConfidence || (confidence === bestConfidence && intent !== 'GREETING')) {
                    bestIntent = intent;
                    bestConfidence = Math.min(95, confidence + 40); // Boost confidence
                }
            }
        }
    }
    
    // Default confidence for unknown
    if (bestIntent === 'UNKNOWN') {
        bestConfidence = 20;
    }
    
    const result: IntentResult = {
        intent: bestIntent,
        confidence: Math.round(bestConfidence),
        entities: extractEntities(input),
        rawInput: input,
        navigationTarget: getNavigationTarget(bestIntent),
    };
    
    console.log('[IntentRouter] Detected:', result);
    return result;
};

// ============================================
// NAVIGATION TARGET MAPPING
// ============================================
const getNavigationTarget = (intent: Intent): IntentResult['navigationTarget'] => {
    switch (intent) {
        case 'NAV_DASHBOARD':
            return 'DASHBOARD';
        case 'NAV_IRRIGATION':
        case 'ASK_IRRIGATION':
        case 'ASK_WATER_AMOUNT':
            return 'IRRIGATION';
        case 'NAV_ALERTS':
        case 'ASK_ALERTS':
            return 'ALERTS';
        case 'NAV_ASSISTANT':
        case 'ASK_TEMPERATURE':
        case 'ASK_HUMIDITY':
        case 'ASK_SOIL_MOISTURE':
        case 'ASK_WEATHER':
        case 'ASK_FERTILIZER':
        case 'ASK_CROP_HEALTH':
        case 'HELP':
            return 'ASSISTANT';
        default:
            return undefined;
    }
};

// ============================================
// VOICE COMMAND SUGGESTIONS
// ============================================
export const getVoiceCommandSuggestions = (): string[] => [
    "Aaj kitna paani dena hai?",
    "Temperature kya hai?",
    "Soil moisture check karo",
    "Fertilizer advice do",
    "Mausam kaisa hai?",
    "Fasal kaisi hai?",
    "Koi alert hai?",
];
