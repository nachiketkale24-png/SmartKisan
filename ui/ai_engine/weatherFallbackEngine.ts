/**
 * AgriGuard Offline AI Engine - Weather Fallback System
 * Uses cached/seasonal data when offline
 * 
 * Responds in Hinglish
 */

// ============================================
// TYPES
// ============================================

export interface WeatherData {
  temperature: number;      // °C
  humidity: number;         // %
  rainfall: number;         // mm (last 24h)
  windSpeed: number;        // km/h
  cloudCover: number;       // %
  uvIndex: number;
  rainProbability: number;  // % chance in next 24h
  source: 'live' | 'cached' | 'seasonal';
  timestamp: Date;
  location?: string;
}

export interface SeasonalPattern {
  month: number;
  avgTemp: { min: number; max: number };
  avgHumidity: number;
  avgRainfall: number;
  rainyDays: number;
  season: 'winter' | 'summer' | 'monsoon' | 'post-monsoon';
}

// ============================================
// SEASONAL DATA (India - North Plains)
// Based on IMD historical averages
// ============================================

const SEASONAL_PATTERNS: SeasonalPattern[] = [
  { month: 1, avgTemp: { min: 7, max: 21 }, avgHumidity: 70, avgRainfall: 18, rainyDays: 2, season: 'winter' },
  { month: 2, avgTemp: { min: 10, max: 24 }, avgHumidity: 60, avgRainfall: 22, rainyDays: 2, season: 'winter' },
  { month: 3, avgTemp: { min: 15, max: 30 }, avgHumidity: 45, avgRainfall: 15, rainyDays: 2, season: 'summer' },
  { month: 4, avgTemp: { min: 21, max: 37 }, avgHumidity: 35, avgRainfall: 10, rainyDays: 1, season: 'summer' },
  { month: 5, avgTemp: { min: 26, max: 41 }, avgHumidity: 35, avgRainfall: 18, rainyDays: 2, season: 'summer' },
  { month: 6, avgTemp: { min: 28, max: 40 }, avgHumidity: 55, avgRainfall: 65, rainyDays: 5, season: 'monsoon' },
  { month: 7, avgTemp: { min: 27, max: 35 }, avgHumidity: 80, avgRainfall: 210, rainyDays: 14, season: 'monsoon' },
  { month: 8, avgTemp: { min: 26, max: 34 }, avgHumidity: 82, avgRainfall: 230, rainyDays: 13, season: 'monsoon' },
  { month: 9, avgTemp: { min: 25, max: 34 }, avgHumidity: 75, avgRainfall: 130, rainyDays: 8, season: 'monsoon' },
  { month: 10, avgTemp: { min: 19, max: 33 }, avgHumidity: 60, avgRainfall: 25, rainyDays: 2, season: 'post-monsoon' },
  { month: 11, avgTemp: { min: 12, max: 28 }, avgHumidity: 55, avgRainfall: 5, rainyDays: 1, season: 'post-monsoon' },
  { month: 12, avgTemp: { min: 8, max: 23 }, avgHumidity: 65, avgRainfall: 10, rainyDays: 1, season: 'winter' }
];

// ============================================
// LOCAL WEATHER CACHE
// ============================================

interface CachedWeather {
  data: WeatherData;
  expiresAt: Date;
}

let weatherCache: CachedWeather | null = null;
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

// ============================================
// MAIN WEATHER ENGINE
// ============================================

export function getWeatherData(forceOffline: boolean = false): WeatherData {
  const now = new Date();
  
  // Check cache first
  if (weatherCache && weatherCache.expiresAt > now && !forceOffline) {
    return weatherCache.data;
  }

  // If offline or no live data, use seasonal fallback
  return getSeasonalFallback(now);
}

export function cacheWeatherData(liveData: Partial<WeatherData>): void {
  const now = new Date();
  weatherCache = {
    data: {
      temperature: liveData.temperature || 25,
      humidity: liveData.humidity || 60,
      rainfall: liveData.rainfall || 0,
      windSpeed: liveData.windSpeed || 10,
      cloudCover: liveData.cloudCover || 30,
      uvIndex: liveData.uvIndex || 5,
      rainProbability: liveData.rainProbability || 20,
      source: 'cached',
      timestamp: now,
      location: liveData.location
    },
    expiresAt: new Date(now.getTime() + CACHE_DURATION_MS)
  };
}

export function getSeasonalFallback(date: Date = new Date()): WeatherData {
  const month = date.getMonth() + 1;
  const hour = date.getHours();
  const pattern = SEASONAL_PATTERNS.find(p => p.month === month) || SEASONAL_PATTERNS[0];

  // Estimate current temperature based on time of day
  const tempRange = pattern.avgTemp.max - pattern.avgTemp.min;
  let tempFactor = 0.5;
  
  if (hour >= 6 && hour < 10) {
    tempFactor = 0.3; // Morning - cooler
  } else if (hour >= 10 && hour < 16) {
    tempFactor = 0.9; // Midday - hottest
  } else if (hour >= 16 && hour < 20) {
    tempFactor = 0.6; // Evening - cooling
  } else {
    tempFactor = 0.2; // Night - coolest
  }

  const estimatedTemp = pattern.avgTemp.min + (tempRange * tempFactor);

  // Estimate rain probability based on seasonal pattern
  const dailyRainProb = (pattern.rainyDays / 30) * 100;

  return {
    temperature: Math.round(estimatedTemp),
    humidity: pattern.avgHumidity,
    rainfall: 0, // Can't predict actual rainfall
    windSpeed: pattern.season === 'monsoon' ? 15 : 10,
    cloudCover: pattern.season === 'monsoon' ? 70 : 30,
    uvIndex: pattern.season === 'summer' ? 9 : 5,
    rainProbability: Math.round(dailyRainProb),
    source: 'seasonal',
    timestamp: date
  };
}

// ============================================
// WEATHER ADVISORY
// ============================================

export interface WeatherAdvisory {
  type: 'favorable' | 'caution' | 'warning' | 'alert';
  title: {
    en: string;
    hi: string;
    hinglish: string;
  };
  advice: {
    en: string;
    hi: string;
    hinglish: string;
  };
  actions: string[];
}

export function getWeatherAdvisory(weather: WeatherData): WeatherAdvisory {
  // High temperature warning
  if (weather.temperature > 40) {
    return {
      type: 'alert',
      title: {
        en: 'Extreme Heat Alert',
        hi: 'अत्यधिक गर्मी की चेतावनी',
        hinglish: 'Bahut Zyada Garmi Alert'
      },
      advice: {
        en: `Temperature ${weather.temperature}°C. Avoid field work during 11 AM - 4 PM. Ensure adequate irrigation.`,
        hi: `तापमान ${weather.temperature}°C. 11 AM - 4 PM के बीच खेत में काम से बचें। पर्याप्त सिंचाई सुनिश्चित करें।`,
        hinglish: `Temperature ${weather.temperature}°C hai. 11 AM - 4 PM ke beech khet mein kaam mat karein. Paani dete rahein.`
      },
      actions: [
        'Irrigate in morning or evening only',
        'Apply mulch to protect roots',
        'Monitor for wilting'
      ]
    };
  }

  // Rain expected
  if (weather.rainProbability > 60) {
    return {
      type: 'caution',
      title: {
        en: 'Rain Expected',
        hi: 'बारिश की संभावना',
        hinglish: 'Baarish Aa Sakti Hai'
      },
      advice: {
        en: `${weather.rainProbability}% chance of rain. Skip irrigation today. Postpone spraying.`,
        hi: `${weather.rainProbability}% बारिश की संभावना। आज सिंचाई न करें। छिड़काव टालें।`,
        hinglish: `${weather.rainProbability}% chance hai baarish ka. Aaj sinchai mat karein. Spray bhi kal karein.`
      },
      actions: [
        'Skip irrigation',
        'Postpone fertilizer application',
        'Postpone pesticide spraying',
        'Ensure drainage channels are clear'
      ]
    };
  }

  // High humidity - disease risk
  if (weather.humidity > 85) {
    return {
      type: 'caution',
      title: {
        en: 'High Humidity - Disease Risk',
        hi: 'अधिक नमी - रोग का खतरा',
        hinglish: 'Zyada Humidity - Bimari Ka Risk'
      },
      advice: {
        en: `Humidity ${weather.humidity}%. Fungal disease risk high. Monitor crops closely.`,
        hi: `आर्द्रता ${weather.humidity}%। फंगल रोग का खतरा। फसलों की निगरानी करें।`,
        hinglish: `Humidity ${weather.humidity}% hai. Fungal bimari ka khatra hai. Fasal check karte rahein.`
      },
      actions: [
        'Avoid overhead irrigation',
        'Keep preventive fungicide ready',
        'Monitor for fungal symptoms'
      ]
    };
  }

  // Favorable conditions
  return {
    type: 'favorable',
    title: {
      en: 'Weather Favorable',
      hi: 'मौसम अनुकूल',
      hinglish: 'Mausam Sahi Hai'
    },
    advice: {
      en: `Good conditions for farming. Temperature ${weather.temperature}°C, Humidity ${weather.humidity}%.`,
      hi: `खेती के लिए अच्छी स्थिति। तापमान ${weather.temperature}°C, आर्द्रता ${weather.humidity}%।`,
      hinglish: `Kheti ke liye achha mausam hai. Temperature ${weather.temperature}°C, Humidity ${weather.humidity}%.`
    },
    actions: [
      'Good day for field operations',
      'Suitable for spraying',
      'Can apply fertilizer'
    ]
  };
}

// ============================================
// QUICK WEATHER CHECK (For Voice)
// ============================================

export function getQuickWeatherAdvice(): string {
  const weather = getWeatherData();
  const advisory = getWeatherAdvisory(weather);

  let response = '';
  
  // Source indicator
  if (weather.source === 'seasonal') {
    response += '📊 (Seasonal data - offline mode)\n';
  } else if (weather.source === 'cached') {
    response += '💾 (Cached data)\n';
  }

  // Main info
  response += `🌡️ Temperature: ${weather.temperature}°C\n`;
  response += `💧 Humidity: ${weather.humidity}%\n`;
  response += `🌧️ Rain chance: ${weather.rainProbability}%\n\n`;

  // Advisory
  const emoji = advisory.type === 'alert' ? '🚨' : 
                advisory.type === 'warning' ? '⚠️' : 
                advisory.type === 'caution' ? '💡' : '✅';
  
  response += `${emoji} ${advisory.title.hinglish}\n`;
  response += advisory.advice.hinglish;

  return response;
}

// ============================================
// IRRIGATION ADJUSTMENT BASED ON WEATHER
// ============================================

export function getWeatherIrrigationFactor(weather: WeatherData): number {
  let factor = 1.0;

  // Temperature adjustment
  if (weather.temperature > 38) {
    factor *= 1.2; // 20% more water in extreme heat
  } else if (weather.temperature < 15) {
    factor *= 0.8; // 20% less in cool weather
  }

  // Humidity adjustment
  if (weather.humidity > 80) {
    factor *= 0.85; // Less evaporation
  } else if (weather.humidity < 40) {
    factor *= 1.1; // More evaporation
  }

  // Rain adjustment
  if (weather.rainProbability > 70) {
    factor *= 0.5; // Significant reduction if rain likely
  } else if (weather.rainProbability > 40) {
    factor *= 0.75; // Moderate reduction
  }

  // Recent rainfall
  if (weather.rainfall > 20) {
    factor *= 0.3; // Skip if significant rain
  } else if (weather.rainfall > 5) {
    factor *= 0.6; // Reduce if light rain
  }

  return Math.round(factor * 100) / 100;
}

// ============================================
// SEASON DETECTION
// ============================================

export function getCurrentSeason(): { name: string; hi: string; advice: string } {
  const month = new Date().getMonth() + 1;
  const pattern = SEASONAL_PATTERNS.find(p => p.month === month);
  
  const seasonInfo: Record<string, { name: string; hi: string; advice: string }> = {
    winter: {
      name: 'Winter (Rabi)',
      hi: 'सर्दी (रबी)',
      advice: 'Wheat, mustard, chickpea ka time hai. Frost se bachao rakho.'
    },
    summer: {
      name: 'Summer (Zaid)',
      hi: 'गर्मी (ज़ायद)',
      advice: 'Garmi mein paani zyada lagta hai. Subah-shaam sinchai karein.'
    },
    monsoon: {
      name: 'Monsoon (Kharif)',
      hi: 'बरसात (खरीफ)',
      advice: 'Dhaan, makka, kapas ka season. Drainage pe dhyan do.'
    },
    'post-monsoon': {
      name: 'Post-Monsoon',
      hi: 'बरसात के बाद',
      advice: 'Rabi ki taiyaari karo. Khet ki jotai shuru karo.'
    }
  };

  const season = pattern?.season || 'winter';
  return seasonInfo[season];
}
