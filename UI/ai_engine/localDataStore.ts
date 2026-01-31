// AgriGuard Local Data Store - Simulated IoT Sensor Data
// This acts as the local cache for offline operation

import { SensorData, WeatherData, CropData } from './types';

// ============================================
// SENSOR DATA - Simulates ESP32 IoT readings
// ============================================
let sensorData: SensorData = {
    soilMoisture: 42,        // Current soil moisture %
    temperature: 32,         // Current temperature °C
    humidity: 65,            // Air humidity %
    isRaining: false,        // Rain sensor status
    lastUpdated: new Date().toISOString(),
};

// ============================================
// WEATHER DATA - Cached from last online sync
// ============================================
let weatherData: WeatherData = {
    currentTemp: 32,
    forecastTemp: 34,
    rainfall: 0,
    rainProbability: 15,
    condition: 'sunny',
    forecast: 'Agle 3 din clear weather, temperature 30-35°C expected',
};

// ============================================
// CROP DATA - Farmer's field configuration
// ============================================
let cropData: CropData = {
    type: 'wheat',
    stage: 'vegetative',
    plantedDate: '2025-11-15',
    healthStatus: 'good',
};

// ============================================
// GETTERS - Access current data
// ============================================
export const getSensorData = (): SensorData => ({ ...sensorData });
export const getWeatherData = (): WeatherData => ({ ...weatherData });
export const getCropData = (): CropData => ({ ...cropData });

// ============================================
// SETTERS - Update data (for demo/IoT sync)
// ============================================
export const updateSensorData = (data: Partial<SensorData>): void => {
    sensorData = {
        ...sensorData,
        ...data,
        lastUpdated: new Date().toISOString(),
    };
    console.log('[LocalDataStore] Sensor data updated:', sensorData);
};

export const updateWeatherData = (data: Partial<WeatherData>): void => {
    weatherData = { ...weatherData, ...data };
    console.log('[LocalDataStore] Weather data updated:', weatherData);
};

export const updateCropData = (data: Partial<CropData>): void => {
    cropData = { ...cropData, ...data };
    console.log('[LocalDataStore] Crop data updated:', cropData);
};

// ============================================
// DEMO MODE - Randomize values for presentation
// ============================================
export const randomizeSensorData = (): SensorData => {
    sensorData = {
        soilMoisture: Math.floor(Math.random() * 60) + 20, // 20-80%
        temperature: Math.floor(Math.random() * 15) + 25,  // 25-40°C
        humidity: Math.floor(Math.random() * 40) + 40,     // 40-80%
        isRaining: Math.random() > 0.85,                   // 15% chance
        lastUpdated: new Date().toISOString(),
    };
    return sensorData;
};

// ============================================
// IoT CONNECTION STATUS
// ============================================
let iotConnected = false;
let lastIoTSync: string | null = null;

export const getIoTStatus = () => ({
    connected: iotConnected,
    lastSync: lastIoTSync,
});

export const setIoTConnected = (connected: boolean): void => {
    iotConnected = connected;
    if (connected) {
        lastIoTSync = new Date().toISOString();
    }
    console.log('[LocalDataStore] IoT connection status:', connected);
};

// ============================================
// SIMULATION - Gradual moisture decrease
// ============================================
let moistureDecayInterval: ReturnType<typeof setInterval> | null = null;

export const startMoistureSimulation = (): void => {
    if (moistureDecayInterval) return;
    
    moistureDecayInterval = setInterval(() => {
        // Moisture decreases over time (evaporation)
        const decay = sensorData.temperature > 35 ? 2 : 1;
        const newMoisture = Math.max(10, sensorData.soilMoisture - decay);
        
        // Rain increases moisture
        if (sensorData.isRaining) {
            updateSensorData({ soilMoisture: Math.min(95, sensorData.soilMoisture + 5) });
        } else {
            updateSensorData({ soilMoisture: newMoisture });
        }
    }, 30000); // Every 30 seconds
    
    console.log('[LocalDataStore] Moisture simulation started');
};

export const stopMoistureSimulation = (): void => {
    if (moistureDecayInterval) {
        clearInterval(moistureDecayInterval);
        moistureDecayInterval = null;
        console.log('[LocalDataStore] Moisture simulation stopped');
    }
};

// ============================================
// ALERT THRESHOLDS
// ============================================
export const ALERT_THRESHOLDS = {
    moistureLow: 25,
    moistureHigh: 85,
    tempHigh: 40,
    tempLow: 5,
};

export const checkAlerts = () => {
    const alerts: string[] = [];
    
    if (sensorData.soilMoisture < ALERT_THRESHOLDS.moistureLow) {
        alerts.push('CRITICAL: Soil moisture bahut kam hai! Turant irrigation karein.');
    } else if (sensorData.soilMoisture > ALERT_THRESHOLDS.moistureHigh) {
        alerts.push('WARNING: Over-irrigation detected. Paani band karein.');
    }
    
    if (sensorData.temperature > ALERT_THRESHOLDS.tempHigh) {
        alerts.push('HEAT ALERT: Temperature 40°C se zyada hai. Dopahar mein irrigation avoid karein.');
    }
    
    if (weatherData.rainProbability > 70) {
        alerts.push('RAIN EXPECTED: Aaj baarish ki sambhavna hai. Irrigation postpone karein.');
    }
    
    return alerts;
};
