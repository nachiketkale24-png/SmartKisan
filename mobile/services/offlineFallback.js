/**
 * Offline Fallback - Deterministic responses when backend is unreachable
 */

import { detectIntent } from './intentRouter';

// Cached sensor data (updated when online)
let cachedSensorData = {
  temperature: 28,
  humidity: 65,
  soilMoisture: 45,
  lastUpdate: null
};

export function updateCachedSensors(data) {
  cachedSensorData = { ...data, lastUpdate: new Date() };
}

export function getCachedSensors() {
  return cachedSensorData;
}

/**
 * Generate offline response based on intent
 */
export function generateOfflineResponse(message, language = 'hi') {
  const intent = detectIntent(message);
  const { temperature, humidity, soilMoisture } = cachedSensorData;
  
  const responses = {
    IRRIGATION: {
      hi: `📡 ऑफ़लाइन मोड में हूं।\n\n💧 आखिरी मिट्टी नमी: ${soilMoisture}%\n${soilMoisture < 40 ? '✅ सिंचाई की जरूरत है।' : '⏳ अभी सिंचाई रोकें।'}`,
      en: `📡 Offline mode.\n\n💧 Last soil moisture: ${soilMoisture}%\n${soilMoisture < 40 ? '✅ Irrigation needed.' : '⏳ Hold irrigation.'}`
    },
    TEMP: {
      hi: `📡 ऑफ़लाइन मोड।\n\n🌡️ आखिरी तापमान: ${temperature}°C\n💧 नमी: ${humidity}%`,
      en: `📡 Offline mode.\n\n🌡️ Last temperature: ${temperature}°C\n💧 Humidity: ${humidity}%`
    },
    FERTILIZER: {
      hi: `📡 ऑफ़लाइन मोड।\n\n🌱 खाद के लिए सर्वर से कनेक्ट होना जरूरी है।\nकृपया इंटरनेट चालू करें।`,
      en: `📡 Offline mode.\n\n🌱 Fertilizer advice requires server connection.\nPlease check internet.`
    },
    HEALTH: {
      hi: `📡 ऑफ़लाइन मोड।\n\n🔍 फसल स्वास्थ्य जांच के लिए सर्वर से कनेक्ट होना जरूरी है।`,
      en: `📡 Offline mode.\n\n🔍 Crop health check requires server connection.`
    },
    ALERTS: {
      hi: `📡 ऑफ़लाइन मोड।\n\n⚠️ अलर्ट देखने के लिए इंटरनेट चालू करें।`,
      en: `📡 Offline mode.\n\n⚠️ Enable internet to view alerts.`
    },
    MOISTURE: {
      hi: `📡 ऑफ़लाइन मोड।\n\n💧 आखिरी मिट्टी नमी: ${soilMoisture}%\n${soilMoisture < 30 ? '🔴 बहुत सूखी' : soilMoisture < 50 ? '🟡 ठीक' : '🟢 अच्छी'}`,
      en: `📡 Offline mode.\n\n💧 Last soil moisture: ${soilMoisture}%\n${soilMoisture < 30 ? '🔴 Very dry' : soilMoisture < 50 ? '🟡 Okay' : '🟢 Good'}`
    },
    UNKNOWN: {
      hi: `📡 ऑफ़लाइन मोड में हूं।\n\nकृपया इंटरनेट चालू करें या सिंचाई, तापमान, खाद जैसे सवाल पूछें।`,
      en: `📡 I'm in offline mode.\n\nPlease enable internet or ask about irrigation, temperature, fertilizer.`
    }
  };
  
  return responses[intent]?.[language] || responses[intent]?.hi || responses.UNKNOWN.hi;
}

export default {
  generateOfflineResponse,
  updateCachedSensors,
  getCachedSensors
};
