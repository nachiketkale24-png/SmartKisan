// AgriGuard AI Engine - Main Export
// Unified interface for all AI functionality

export * from './types';
export * from './localDataStore';
export * from './intentRouter';
export * from './irrigationEngine';
export * from './fertilizerEngine';
export * from './responseEngine';

// Re-export main functions for easy access
import { processUserMessage, generateAIResponse } from './responseEngine';
import { detectIntent } from './intentRouter';
import { getIrrigationDecision } from './irrigationEngine';
import { getFertilizerRecommendation } from './fertilizerEngine';
import { 
    getSensorData, 
    getWeatherData, 
    getCropData, 
    updateSensorData,
    updateWeatherData,
    updateCropData,
    getIoTStatus,
    setIoTConnected,
    checkAlerts,
    randomizeSensorData,
} from './localDataStore';

// Main AI interface
export const AgriGuardAI = {
    // Chat interface
    chat: processUserMessage,
    generateResponse: generateAIResponse,
    
    // Intent detection
    detectIntent,
    
    // Decision engines
    getIrrigationAdvice: getIrrigationDecision,
    getFertilizerAdvice: getFertilizerRecommendation,
    
    // Data access
    getSensorData,
    getWeatherData,
    getCropData,
    getIoTStatus,
    checkAlerts,
    
    // Data updates (for IoT/Demo)
    updateSensorData,
    updateWeatherData,
    updateCropData,
    setIoTConnected,
    randomizeSensorData,
};

export default AgriGuardAI;
