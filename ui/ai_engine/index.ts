/**
 * AgriGuard Offline AI Engine - Main Entry Point
 * 
 * Hybrid Architecture: Rule-based Expert System + Lightweight Decision Logic
 * Dataset: FAO + ICAR Combined
 * Crops: Wheat, Rice, Cotton
 * Language: Hinglish (Hindi + English)
 * 
 * Memory: < 20MB
 * Offline-first, IoT-ready
 */

// Core Data
export {
  CROP_DATABASE,
  FERTILIZER_SCHEDULES,
  SOIL_DATABASE,
  MONTHLY_ETO,
  getCurrentStage,
  getNextFertilizerSchedule,
  getCropNames,
  type CropType,
  type SoilType,
  type GrowthStage,
  type CropData,
  type CropStageData,
  type FertilizerSchedule,
  type SoilData
} from './cropData';

// Irrigation Engine
export {
  calculateIrrigation,
  getQuickIrrigationAdvice,
  calculateWaterSavings,
  type IrrigationInput,
  type IrrigationOutput
} from './irrigationEngine';

// Fertilizer Engine
export {
  calculateFertilizer,
  getQuickFertilizerAdvice,
  type FertilizerInput,
  type FertilizerOutput
} from './fertilizerEngine';

// Crop Health Engine
export {
  diagnoseCropHealth,
  getQuickHealthAdvice,
  getAvailableSymptoms,
  type SymptomType,
  type CropHealthInput,
  type CropHealthOutput
} from './cropHealthEngine';

// Weather Fallback Engine
export {
  getWeatherData,
  cacheWeatherData,
  getSeasonalFallback,
  getWeatherAdvisory,
  getQuickWeatherAdvice,
  getCurrentSeason,
  getWeatherIrrigationFactor,
  type WeatherData,
  type WeatherAdvisory
} from './weatherFallbackEngine';

// Voice Command Router
export {
  processVoiceCommand,
  detectIntent,
  getQuickCommands,
  type IntentType,
  type VoiceCommand,
  type VoiceResponse,
  type SensorContext
} from './voiceCommandRouter';

// IoT Sensor Service
export {
  getSensorData,
  cacheSensorData,
  getDemoSensorData,
  getFarmContext,
  setFarmContext,
  getConnectedDevices,
  addConnectedDevice,
  updateDeviceStatus,
  removeDevice,
  onESP32Message,
  sendCommandToESP32,
  getSyncStatus,
  updateSyncStatus,
  initializeSensorService,
  type SensorData,
  type DeviceInfo,
  type FarmContext,
  type ESP32Message,
  type SyncStatus
} from './sensorService';

// ============================================
// UNIFIED AI ASSISTANT
// ============================================

import { processVoiceCommand, VoiceCommand, VoiceResponse, SensorContext } from './voiceCommandRouter';
import { getSensorData, getFarmContext, initializeSensorService } from './sensorService';
import { getWeatherData } from './weatherFallbackEngine';

/**
 * Main AI Assistant function - processes any query with full context
 */
export function askAI(query: string): VoiceResponse {
  // Get current sensor and farm context
  const sensorData = getSensorData();
  const farmContext = getFarmContext();
  const weather = getWeatherData();

  // Build context for AI
  const context: SensorContext = {
    soilMoisture: sensorData.soilMoisture,
    temperature: sensorData.temperature,
    humidity: sensorData.humidity,
    cropType: farmContext.cropType,
    daysAfterSowing: farmContext.daysAfterSowing,
    soilType: farmContext.soilType
  };

  // Process through voice command router
  const command: VoiceCommand = {
    transcript: query,
    confidence: 1.0,
    language: 'hi-en'
  };

  return processVoiceCommand(command, context);
}

/**
 * Initialize the entire AI engine
 */
export function initializeAIEngine(): void {
  initializeSensorService();
  console.log('🤖 AgriGuard AI Engine initialized');
  console.log('📊 Mode: Hybrid (Rules + Decision Logic)');
  console.log('🌾 Crops: Wheat, Rice, Cotton');
  console.log('🗣️ Language: Hinglish');
}

/**
 * Get system status summary
 */
export function getSystemStatus(): {
  aiEngine: 'online' | 'offline';
  sensorSource: 'live' | 'cached' | 'demo';
  weatherSource: 'live' | 'cached' | 'seasonal';
  cropType: string;
  daysAfterSowing: number;
} {
  const sensor = getSensorData();
  const weather = getWeatherData();
  const farm = getFarmContext();

  return {
    aiEngine: 'online', // Always online (offline-first)
    sensorSource: sensor.source,
    weatherSource: weather.source,
    cropType: farm.cropType,
    daysAfterSowing: farm.daysAfterSowing
  };
}
