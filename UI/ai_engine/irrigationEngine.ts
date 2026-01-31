// AgriGuard Irrigation Engine - ETc-based Decision Logic
// Uses FAO Penman-Monteith simplified + ICAR guidelines

import { SensorData, WeatherData, CropData, CROP_KC_VALUES, OPTIMAL_MOISTURE } from './types';
import { getSensorData, getWeatherData, getCropData } from './localDataStore';

export interface IrrigationDecision {
    shouldIrrigate: boolean;
    action: 'irrigate' | 'stop' | 'reduce' | 'wait';
    waterAmount: number;  // mm
    reason: string;
    hindiReason: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;
}

// ============================================
// REFERENCE EVAPOTRANSPIRATION (ETo) - Simplified
// ============================================
const calculateETo = (temp: number, humidity: number): number => {
    // Simplified Hargreaves equation for offline use
    // ETo = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra
    // Simplified: ETo ≈ 0.1 * temp - humidity factor
    
    const humidityFactor = (100 - humidity) / 100;
    const eto = (0.12 * temp - 1.5) * (1 + humidityFactor * 0.3);
    return Math.max(2, Math.min(10, eto)); // Clamp between 2-10 mm/day
};

// ============================================
// CROP WATER REQUIREMENT (ETc)
// ============================================
const calculateETc = (eto: number, crop: CropData): number => {
    const kcValues = CROP_KC_VALUES[crop.type] || CROP_KC_VALUES.wheat;
    
    let kc: number;
    switch (crop.stage) {
        case 'sowing':
            kc = kcValues.initial;
            break;
        case 'vegetative':
            kc = (kcValues.initial + kcValues.mid) / 2;
            break;
        case 'flowering':
            kc = kcValues.mid;
            break;
        case 'harvesting':
            kc = kcValues.end;
            break;
        default:
            kc = kcValues.mid;
    }
    
    return eto * kc;
};

// ============================================
// MAIN IRRIGATION DECISION ENGINE
// ============================================
export const getIrrigationDecision = (
    sensor?: SensorData,
    weather?: WeatherData,
    crop?: CropData
): IrrigationDecision => {
    // Use provided data or fetch from store
    const sensorData = sensor || getSensorData();
    const weatherData = weather || getWeatherData();
    const cropData = crop || getCropData();
    
    console.log('[IrrigationEngine] Input data:', { sensorData, weatherData, cropData });
    
    const { soilMoisture, temperature, humidity, isRaining } = sensorData;
    const { rainfall, rainProbability } = weatherData;
    const optimalRange = OPTIMAL_MOISTURE[cropData.type] || OPTIMAL_MOISTURE.wheat;
    
    // ===== RULE 1: Rain Check =====
    if (isRaining) {
        return {
            shouldIrrigate: false,
            action: 'stop',
            waterAmount: 0,
            reason: 'Rain is currently falling. No irrigation needed.',
            hindiReason: 'Abhi baarish ho rahi hai. Irrigation ki zaroorat nahi.',
            urgency: 'low',
            confidence: 98,
        };
    }
    
    // ===== RULE 2: Rain Forecast =====
    if (rainProbability > 70) {
        return {
            shouldIrrigate: false,
            action: 'wait',
            waterAmount: 0,
            reason: `High rain probability (${rainProbability}%). Wait for rain.`,
            hindiReason: `Baarish ki ${rainProbability}% sambhavna hai. Ruk jaayein, baarish aane wali hai.`,
            urgency: 'low',
            confidence: 85,
        };
    }
    
    // ===== RULE 3: Over-irrigation Detection =====
    if (soilMoisture > optimalRange.max) {
        const excess = soilMoisture - optimalRange.max;
        return {
            shouldIrrigate: false,
            action: 'stop',
            waterAmount: 0,
            reason: `Soil moisture (${soilMoisture}%) is above optimal (${optimalRange.max}%). Over-irrigation risk!`,
            hindiReason: `Mitti mein nami ${soilMoisture}% hai jo ${optimalRange.max}% se zyada hai. Over-irrigation ho sakti hai! Paani band rakhein.`,
            urgency: excess > 15 ? 'high' : 'medium',
            confidence: 95,
        };
    }
    
    // ===== RULE 4: Critical Low Moisture =====
    if (soilMoisture < optimalRange.critical) {
        const eto = calculateETo(temperature, humidity);
        const etc = calculateETc(eto, cropData);
        const waterNeeded = Math.round(etc * 1.5); // Extra water for critical
        
        return {
            shouldIrrigate: true,
            action: 'irrigate',
            waterAmount: waterNeeded,
            reason: `CRITICAL: Soil moisture (${soilMoisture}%) is dangerously low! Immediate irrigation needed.`,
            hindiReason: `EMERGENCY: Mitti mein nami sirf ${soilMoisture}% hai! Turant ${waterNeeded}mm paani dein. Fasal sukh rahi hai.`,
            urgency: 'critical',
            confidence: 98,
        };
    }
    
    // ===== RULE 5: Low Moisture - Needs Irrigation =====
    if (soilMoisture < optimalRange.min) {
        const eto = calculateETo(temperature, humidity);
        const etc = calculateETc(eto, cropData);
        const waterNeeded = Math.round(etc);
        
        // Adjust for temperature
        const tempAdjusted = temperature > 35 
            ? Math.round(waterNeeded * 1.2) 
            : waterNeeded;
        
        return {
            shouldIrrigate: true,
            action: 'irrigate',
            waterAmount: tempAdjusted,
            reason: `Soil moisture (${soilMoisture}%) is low. ${cropData.type} needs ${tempAdjusted}mm water.`,
            hindiReason: `Mitti mein nami ${soilMoisture}% hai jo kam hai. ${cropData.type === 'wheat' ? 'Gehun' : cropData.type === 'rice' ? 'Dhan' : 'Kapas'} ko ${tempAdjusted}mm paani dein.`,
            urgency: 'high',
            confidence: 90,
        };
    }
    
    // ===== RULE 6: Optimal Range - No Irrigation =====
    if (soilMoisture >= optimalRange.min && soilMoisture <= optimalRange.max) {
        return {
            shouldIrrigate: false,
            action: 'stop',
            waterAmount: 0,
            reason: `Soil moisture (${soilMoisture}%) is in optimal range (${optimalRange.min}-${optimalRange.max}%). No irrigation needed today.`,
            hindiReason: `Mitti mein nami ${soilMoisture}% hai jo bilkul sahi hai (${optimalRange.min}-${optimalRange.max}%). Aaj paani dene ki zaroorat nahi.`,
            urgency: 'low',
            confidence: 92,
        };
    }
    
    // Default fallback
    return {
        shouldIrrigate: false,
        action: 'wait',
        waterAmount: 0,
        reason: 'Conditions uncertain. Check sensors and try again.',
        hindiReason: 'Halaat clear nahi hai. Sensor check karein aur dobara try karein.',
        urgency: 'medium',
        confidence: 50,
    };
};

// ============================================
// WATER SAVINGS CALCULATOR
// ============================================
export const calculateWaterSavings = (
    traditionalWater: number,
    recommendedWater: number
): { saved: number; percentage: number; hindiText: string } => {
    const saved = Math.max(0, traditionalWater - recommendedWater);
    const percentage = traditionalWater > 0 
        ? Math.round((saved / traditionalWater) * 100) 
        : 0;
    
    return {
        saved,
        percentage,
        hindiText: percentage > 0 
            ? `Smart irrigation se ${saved}mm (${percentage}%) paani bach raha hai!`
            : 'Aaj recommended amount hi use ho rahi hai.',
    };
};
