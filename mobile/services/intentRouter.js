/**
 * Local Intent Router - Hindi/Hinglish/English keywords
 * Used for offline fallback when backend is unreachable
 */

const INTENT_KEYWORDS = {
  IRRIGATION: [
    // Hindi
    'पानी', 'सिंचाई', 'इरिगेशन', 'देना', 'करूं', 'करना', 'डालूं', 'डालना',
    // Hinglish
    'paani', 'sinchai', 'irrigation', 'pani',
    // English
    'water', 'irrigate', 'watering'
  ],
  TEMP: [
    // Hindi
    'तापमान', 'गर्मी', 'ठंड', 'मौसम', 'तापमान',
    // Hinglish
    'taapman', 'garmi', 'thand', 'mausam', 'temperature',
    // English
    'temperature', 'heat', 'cold', 'weather', 'temp'
  ],
  FERTILIZER: [
    // Hindi
    'खाद', 'उर्वरक', 'फर्टिलाइज़र', 'दवाई',
    // Hinglish
    'khad', 'urvarak', 'fertilizer', 'dawai',
    // English
    'fertilizer', 'nutrient', 'manure', 'compost'
  ],
  HEALTH: [
    // Hindi
    'बीमारी', 'रोग', 'कीट', 'पत्ते', 'पीला', 'स्वास्थ्य',
    // Hinglish
    'bimari', 'rog', 'keet', 'patte', 'peela', 'health',
    // English
    'disease', 'pest', 'insect', 'yellow', 'leaf', 'health', 'sick'
  ],
  ALERTS: [
    // Hindi
    'चेतावनी', 'अलर्ट', 'खतरा', 'सावधान',
    // Hinglish
    'chetawani', 'alert', 'khatra', 'savdhan',
    // English
    'alert', 'warning', 'danger', 'notification'
  ],
  MOISTURE: [
    // Hindi
    'नमी', 'गीला', 'सूखा', 'मिट्टी',
    // Hinglish
    'nami', 'geela', 'sukha', 'mitti', 'moisture',
    // English
    'moisture', 'wet', 'dry', 'soil', 'humidity'
  ]
};

/**
 * Detect intent from user message
 */
export function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return intent;
      }
    }
  }
  
  return 'UNKNOWN';
}

export default { detectIntent, INTENT_KEYWORDS };
