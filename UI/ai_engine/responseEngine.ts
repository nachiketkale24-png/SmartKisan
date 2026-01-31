// AgriGuard Response Engine - Unified AI Response Generator
// Connects Intent Router + Engines → Hinglish Response

import { Intent, IntentResult, AIResponse } from './types';
import { detectIntent } from './intentRouter';
import { getSensorData, getWeatherData, getCropData, checkAlerts, getIoTStatus } from './localDataStore';
import { getIrrigationDecision } from './irrigationEngine';
import { getFertilizerRecommendation } from './fertilizerEngine';

// ============================================
// MAIN RESPONSE GENERATOR
// ============================================
export const generateAIResponse = (userInput: string): AIResponse => {
    // Step 1: Detect Intent
    const intentResult = detectIntent(userInput);
    console.log('[ResponseEngine] Intent detected:', intentResult);
    
    // Step 2: Get current data
    const sensor = getSensorData();
    const weather = getWeatherData();
    const crop = getCropData();
    const iotStatus = getIoTStatus();
    
    console.log('[ResponseEngine] Data context:', { sensor, weather, crop });
    
    // Step 3: Route to appropriate handler
    switch (intentResult.intent) {
        case 'ASK_TEMPERATURE':
            return handleTemperatureQuery(sensor, weather);
            
        case 'ASK_HUMIDITY':
            return handleHumidityQuery(sensor);
            
        case 'ASK_SOIL_MOISTURE':
            return handleSoilMoistureQuery(sensor, crop);
            
        case 'ASK_WEATHER':
            return handleWeatherQuery(weather, sensor);
            
        case 'ASK_IRRIGATION':
        case 'ASK_WATER_AMOUNT':
            return handleIrrigationQuery(sensor, weather, crop);
            
        case 'ASK_FERTILIZER':
            return handleFertilizerQuery(crop, intentResult);
            
        case 'ASK_CROP_HEALTH':
            return handleCropHealthQuery(sensor, crop);
            
        case 'ASK_ALERTS':
            return handleAlertsQuery();
            
        case 'GREETING':
            return handleGreeting();
            
        case 'THANKS':
            return handleThanks();
            
        case 'HELP':
            return handleHelp();
            
        default:
            return handleUnknown(userInput);
    }
};

// ============================================
// INTENT HANDLERS
// ============================================

const handleTemperatureQuery = (sensor: ReturnType<typeof getSensorData>, weather: ReturnType<typeof getWeatherData>): AIResponse => {
    const temp = sensor.temperature;
    let advice = '';
    
    if (temp > 40) {
        advice = 'Bahut garmi hai! Dopahar 11-4 baje irrigation avoid karein. Paudho ko shade dein.';
    } else if (temp > 35) {
        advice = 'Garmi zyada hai. Subah ya shaam irrigation karein, dopahar nahi.';
    } else if (temp > 25) {
        advice = 'Temperature normal hai. Farming activities kar sakte hain.';
    } else if (temp > 15) {
        advice = 'Thanda mausam hai. Frost risk check karein.';
    } else {
        advice = 'Bahut thand hai! Fasal ko frost damage ho sakta hai. Cover karein.';
    }
    
    return {
        text: `Current temperature is ${temp}°C. ${advice}`,
        hindiText: `Abhi temperature ${temp}°C hai. ${advice}`,
        confidence: 95,
        dataUsed: ['temperature_sensor', 'real_time'],
    };
};

const handleHumidityQuery = (sensor: ReturnType<typeof getSensorData>): AIResponse => {
    const humidity = sensor.humidity;
    let advice = '';
    
    if (humidity > 80) {
        advice = 'Humidity bahut zyada hai. Fungal disease ka risk hai. Spray schedule check karein.';
    } else if (humidity > 60) {
        advice = 'Humidity normal range mein hai.';
    } else {
        advice = 'Humidity kam hai. Evaporation zyada hogi, irrigation adjust karein.';
    }
    
    return {
        text: `Air humidity is ${humidity}%. ${advice}`,
        hindiText: `Hawa mein nami ${humidity}% hai. ${advice}`,
        confidence: 92,
        dataUsed: ['humidity_sensor'],
    };
};

const handleSoilMoistureQuery = (sensor: ReturnType<typeof getSensorData>, crop: ReturnType<typeof getCropData>): AIResponse => {
    const moisture = sensor.soilMoisture;
    const cropName = crop.type === 'wheat' ? 'Gehun' : crop.type === 'rice' ? 'Dhan' : 'Kapas';
    
    let status = '';
    let advice = '';
    
    if (moisture > 80) {
        status = 'bahut zyada';
        advice = 'Over-watering ho rahi hai. Kuch din paani band rakhein.';
    } else if (moisture >= 40 && moisture <= 70) {
        status = 'bilkul sahi';
        advice = `${cropName} ke liye perfect hai. Aaj paani dene ki zaroorat nahi.`;
    } else if (moisture >= 25) {
        status = 'thodi kam';
        advice = 'Kal irrigation plan karein.';
    } else {
        status = 'bahut kam';
        advice = 'Turant paani dein! Fasal stress mein hai.';
    }
    
    return {
        text: `Soil moisture is ${moisture}% which is ${status}. ${advice}`,
        hindiText: `Mitti mein nami ${moisture}% hai jo ${status} hai. ${advice}`,
        confidence: 94,
        dataUsed: ['soil_moisture_sensor', 'crop_data'],
    };
};

const handleWeatherQuery = (weather: ReturnType<typeof getWeatherData>, sensor: ReturnType<typeof getSensorData>): AIResponse => {
    const { currentTemp, rainProbability, condition, forecast } = weather;
    const isRaining = sensor.isRaining;
    
    let weatherStatus = '';
    let hindiStatus = '';
    
    if (isRaining) {
        weatherStatus = 'It is currently raining.';
        hindiStatus = 'Abhi baarish ho rahi hai.';
    } else {
        const conditions: Record<string, string> = {
            sunny: 'Dhoop nikli hai.',
            cloudy: 'Badal chhaye hain.',
            rainy: 'Baarish ho rahi hai.',
            partly_cloudy: 'Thode badal hain.',
        };
        hindiStatus = conditions[condition] || 'Mausam theek hai.';
        weatherStatus = `Weather is ${condition}.`;
    }
    
    let rainAdvice = '';
    if (rainProbability > 70) {
        rainAdvice = `Baarish ki ${rainProbability}% sambhavna hai. Irrigation postpone karein.`;
    } else if (rainProbability > 40) {
        rainAdvice = `Baarish ho sakti hai (${rainProbability}% chance). Dhyan rakhein.`;
    }
    
    return {
        text: `${weatherStatus} Temperature: ${currentTemp}°C. Rain probability: ${rainProbability}%. ${forecast}`,
        hindiText: `${hindiStatus} Temperature ${currentTemp}°C hai. ${rainAdvice} ${forecast}`,
        confidence: 88,
        dataUsed: ['weather_cache', 'rain_sensor'],
    };
};

const handleIrrigationQuery = (
    sensor: ReturnType<typeof getSensorData>,
    weather: ReturnType<typeof getWeatherData>,
    crop: ReturnType<typeof getCropData>
): AIResponse => {
    const decision = getIrrigationDecision(sensor, weather, crop);
    
    return {
        text: decision.reason,
        hindiText: decision.hindiReason,
        action: decision.action,
        value: decision.waterAmount,
        unit: 'mm',
        confidence: decision.confidence,
        dataUsed: ['soil_moisture', 'temperature', 'weather_forecast', 'crop_coefficient'],
    };
};

const handleFertilizerQuery = (crop: ReturnType<typeof getCropData>, intent: IntentResult): AIResponse => {
    // Use entities if provided, otherwise use stored crop data
    const cropToUse = intent.entities.crop 
        ? { ...crop, type: intent.entities.crop as any }
        : crop;
    const stageToUse = intent.entities.stage
        ? { ...cropToUse, stage: intent.entities.stage as any }
        : cropToUse;
    
    const recommendation = getFertilizerRecommendation(stageToUse);
    
    let fullResponse = recommendation.hindiResponse;
    if (recommendation.warnings.length > 0) {
        fullResponse += ' ⚠️ ' + recommendation.warnings.join(' ');
    }
    fullResponse += ` Agli application: ${recommendation.nextApplication}`;
    
    return {
        text: `${recommendation.fertilizer.type} - ${recommendation.fertilizer.quantity}. ${recommendation.fertilizer.reason}`,
        hindiText: fullResponse,
        action: recommendation.recommended ? 'fertilize' : undefined,
        confidence: 90,
        dataUsed: ['crop_type', 'growth_stage', 'ICAR_guidelines'],
    };
};

const handleCropHealthQuery = (sensor: ReturnType<typeof getSensorData>, crop: ReturnType<typeof getCropData>): AIResponse => {
    const { soilMoisture, temperature } = sensor;
    const cropName = crop.type === 'wheat' ? 'Gehun' : crop.type === 'rice' ? 'Dhan' : 'Kapas';
    
    let healthStatus = '';
    let advice = '';
    
    // Simple health assessment based on conditions
    const moistureOk = soilMoisture >= 35 && soilMoisture <= 75;
    const tempOk = temperature >= 15 && temperature <= 38;
    
    if (moistureOk && tempOk) {
        healthStatus = 'excellent';
        advice = `${cropName} ki halat bahut achhi hai! Sab kuch normal hai.`;
    } else if (moistureOk || tempOk) {
        healthStatus = 'good';
        if (!moistureOk) {
            advice = `${cropName} theek hai lekin soil moisture adjust karein.`;
        } else {
            advice = `${cropName} theek hai lekin temperature extreme hai. Dhyan rakhein.`;
        }
    } else {
        healthStatus = 'needs attention';
        advice = `${cropName} ko attention chahiye. Moisture: ${soilMoisture}%, Temp: ${temperature}°C - conditions optimal nahi hain.`;
    }
    
    return {
        text: `Crop health status: ${healthStatus}. ${advice}`,
        hindiText: `Fasal ki halat: ${healthStatus === 'excellent' ? 'bahut achhi' : healthStatus === 'good' ? 'theek' : 'dhyan dein'}. ${advice}`,
        confidence: 85,
        dataUsed: ['soil_moisture', 'temperature', 'crop_stage'],
    };
};

const handleAlertsQuery = (): AIResponse => {
    const alerts = checkAlerts();
    
    if (alerts.length === 0) {
        return {
            text: 'No active alerts. All systems normal.',
            hindiText: 'Koi alert nahi hai. Sab kuch theek chal raha hai. ✅',
            confidence: 95,
            dataUsed: ['alert_system'],
        };
    }
    
    return {
        text: `Active alerts: ${alerts.join(' | ')}`,
        hindiText: `⚠️ Alerts: ${alerts.join(' | ')}`,
        action: 'alert',
        confidence: 95,
        dataUsed: ['alert_system', 'sensor_thresholds'],
    };
};

const handleGreeting = (): AIResponse => {
    const greetings = [
        'Namaste! Main aapka farming assistant hoon. Irrigation, fertilizer, ya mausam ke baare mein poochein.',
        'Pranam! Kaise madad kar sakta hoon? Paani, khad, ya fasal ke baare mein bataiye.',
        'Namaste kisan bhai! Aaj main kya help kar sakta hoon?',
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
        text: 'Hello! I am your farming assistant. Ask me about irrigation, fertilizer, or weather.',
        hindiText: randomGreeting,
        confidence: 100,
        dataUsed: [],
    };
};

const handleThanks = (): AIResponse => {
    return {
        text: 'You\'re welcome! Feel free to ask more questions.',
        hindiText: 'Dhanyawad! Aur kuch poochna ho toh zaroor poochein. Jai Jawan Jai Kisan! 🌾',
        confidence: 100,
        dataUsed: [],
    };
};

const handleHelp = (): AIResponse => {
    return {
        text: 'I can help with: irrigation advice, fertilizer recommendations, weather updates, crop health check, and alerts.',
        hindiText: 'Main ye madad kar sakta hoon:\n• "Aaj paani dena hai?" - Irrigation advice\n• "Temperature kya hai?" - Mausam info\n• "Fertilizer batao" - Khad recommendation\n• "Fasal kaisi hai?" - Crop health\n• "Koi alert hai?" - Warnings\n\nBas pooch lijiye!',
        confidence: 100,
        dataUsed: [],
    };
};

const handleUnknown = (input: string): AIResponse => {
    return {
        text: `I'm not sure about "${input}". Try asking about irrigation, weather, fertilizer, or crop health.`,
        hindiText: `Maaf kijiye, "${input}" samajh nahi aaya. Kya aap irrigation, mausam, fertilizer, ya fasal ke baare mein poochna chahte hain?`,
        confidence: 30,
        dataUsed: [],
    };
};

// ============================================
// EXPORT FOR CHAT INTEGRATION
// ============================================
export const processUserMessage = (message: string): string => {
    const response = generateAIResponse(message);
    console.log('[ResponseEngine] Final response:', response);
    return response.hindiText;
};
