/**
 * AgriGuard Offline AI Engine - IoT Sensor Integration
 * ESP32 Connection + Fallback Cache
 * 
 * Connection Priority:
 * 1. Live ESP32 sensor data (when connected)
 * 2. Cached sensor data (recently synced)
 * 3. Demo/seasonal fallback data (offline mode)
 */

import { CropType, SoilType } from './cropData';

// ============================================
// TYPES
// ============================================

export interface SensorData {
  soilMoisture: number;       // %
  temperature: number;        // °C
  humidity: number;           // %
  lightIntensity?: number;    // lux
  rainfall?: number;          // mm (last 24h)
  batteryLevel?: number;      // % (sensor battery)
  timestamp: Date;
  source: 'live' | 'cached' | 'demo';
  deviceId?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'ESP32' | 'Arduino' | 'RaspberryPi' | 'Generic';
  status: 'connected' | 'disconnected' | 'searching';
  lastSeen: Date;
  batteryLevel?: number;
  firmwareVersion?: string;
  ipAddress?: string;
}

export interface FarmContext {
  cropType: CropType;
  daysAfterSowing: number;
  soilType: SoilType;
  fieldSize: number;          // hectares
  location?: {
    lat: number;
    lng: number;
    district?: string;
    state?: string;
  };
}

// ============================================
// SENSOR CACHE
// ============================================

interface CachedSensor {
  data: SensorData;
  expiresAt: Date;
}

const SENSOR_CACHE_KEY = 'agriguard_sensor_cache';
const FARM_CONTEXT_KEY = 'agriguard_farm_context';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

// In-memory cache (faster access)
let sensorCache: CachedSensor | null = null;
let farmContext: FarmContext | null = null;
let connectedDevices: DeviceInfo[] = [];

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('LocalStorage load failed:', e);
    return null;
  }
}

// ============================================
// SENSOR DATA MANAGEMENT
// ============================================

export function getSensorData(): SensorData {
  const now = new Date();

  // Try in-memory cache first
  if (sensorCache && sensorCache.expiresAt > now) {
    return sensorCache.data;
  }

  // Try localStorage cache
  const storedCache = loadFromLocalStorage<CachedSensor>(SENSOR_CACHE_KEY);
  if (storedCache && new Date(storedCache.expiresAt) > now) {
    sensorCache = {
      data: { ...storedCache.data, timestamp: new Date(storedCache.data.timestamp) },
      expiresAt: new Date(storedCache.expiresAt)
    };
    return sensorCache.data;
  }

  // Return demo data
  return getDemoSensorData();
}

export function cacheSensorData(data: Partial<SensorData>): void {
  const now = new Date();
  const fullData: SensorData = {
    soilMoisture: data.soilMoisture ?? 45,
    temperature: data.temperature ?? 28,
    humidity: data.humidity ?? 60,
    lightIntensity: data.lightIntensity,
    rainfall: data.rainfall ?? 0,
    batteryLevel: data.batteryLevel,
    timestamp: now,
    source: data.source || 'cached',
    deviceId: data.deviceId
  };

  sensorCache = {
    data: fullData,
    expiresAt: new Date(now.getTime() + CACHE_DURATION_MS)
  };

  saveToLocalStorage(SENSOR_CACHE_KEY, sensorCache);
}

export function getDemoSensorData(): SensorData {
  // Generate realistic demo data based on time of day
  const hour = new Date().getHours();
  const month = new Date().getMonth() + 1;

  // Temperature varies by time of day
  let baseTemp = 25;
  if (month >= 4 && month <= 6) baseTemp = 35; // Summer
  else if (month >= 11 || month <= 2) baseTemp = 18; // Winter
  else if (month >= 7 && month <= 9) baseTemp = 28; // Monsoon

  const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
  const temperature = Math.round(baseTemp + tempVariation);

  // Soil moisture (simulated depletion)
  const baselineMoisture = 50;
  const dailyDepletion = (hour / 24) * 15; // Loses ~15% per day
  const soilMoisture = Math.max(25, Math.round(baselineMoisture - dailyDepletion + Math.random() * 10));

  // Humidity (inverse to temperature)
  const humidity = Math.round(70 - (temperature - 25) * 2 + Math.random() * 10);

  return {
    soilMoisture,
    temperature,
    humidity: Math.min(95, Math.max(30, humidity)),
    lightIntensity: hour >= 6 && hour <= 18 ? Math.round(50000 * Math.sin((hour - 6) * Math.PI / 12)) : 0,
    rainfall: 0,
    batteryLevel: 85,
    timestamp: new Date(),
    source: 'demo'
  };
}

// ============================================
// FARM CONTEXT MANAGEMENT
// ============================================

export function getFarmContext(): FarmContext {
  if (farmContext) return farmContext;

  const stored = loadFromLocalStorage<FarmContext>(FARM_CONTEXT_KEY);
  if (stored) {
    farmContext = stored;
    return farmContext;
  }

  // Default context
  return {
    cropType: 'wheat',
    daysAfterSowing: 45,
    soilType: 'loamy',
    fieldSize: 2.5
  };
}

export function setFarmContext(context: Partial<FarmContext>): void {
  const current = getFarmContext();
  farmContext = { ...current, ...context };
  saveToLocalStorage(FARM_CONTEXT_KEY, farmContext);
}

// ============================================
// DEVICE CONNECTION (ESP32)
// ============================================

export function getConnectedDevices(): DeviceInfo[] {
  return connectedDevices;
}

export function addConnectedDevice(device: Partial<DeviceInfo>): void {
  const newDevice: DeviceInfo = {
    id: device.id || `device_${Date.now()}`,
    name: device.name || 'Unknown Device',
    type: device.type || 'ESP32',
    status: device.status || 'connected',
    lastSeen: new Date(),
    batteryLevel: device.batteryLevel,
    firmwareVersion: device.firmwareVersion,
    ipAddress: device.ipAddress
  };

  const existingIndex = connectedDevices.findIndex(d => d.id === newDevice.id);
  if (existingIndex >= 0) {
    connectedDevices[existingIndex] = newDevice;
  } else {
    connectedDevices.push(newDevice);
  }
}

export function updateDeviceStatus(deviceId: string, status: DeviceInfo['status']): void {
  const device = connectedDevices.find(d => d.id === deviceId);
  if (device) {
    device.status = status;
    device.lastSeen = new Date();
  }
}

export function removeDevice(deviceId: string): void {
  connectedDevices = connectedDevices.filter(d => d.id !== deviceId);
}

// ============================================
// ESP32 COMMUNICATION (Simulated)
// ============================================

export interface ESP32Message {
  type: 'sensor_data' | 'status' | 'command_response';
  deviceId: string;
  payload: any;
  timestamp: Date;
}

type MessageHandler = (message: ESP32Message) => void;
const messageHandlers: MessageHandler[] = [];

export function onESP32Message(handler: MessageHandler): () => void {
  messageHandlers.push(handler);
  return () => {
    const index = messageHandlers.indexOf(handler);
    if (index >= 0) messageHandlers.splice(index, 1);
  };
}

export function simulateESP32Connection(): void {
  // Simulate device discovery
  setTimeout(() => {
    addConnectedDevice({
      id: 'esp32_field1',
      name: 'Field Sensor 1',
      type: 'ESP32',
      status: 'connected',
      batteryLevel: 87,
      firmwareVersion: '1.2.0',
      ipAddress: '192.168.1.100'
    });

    // Notify handlers
    const message: ESP32Message = {
      type: 'status',
      deviceId: 'esp32_field1',
      payload: { status: 'connected' },
      timestamp: new Date()
    };
    messageHandlers.forEach(h => h(message));
  }, 2000);

  // Simulate periodic sensor updates
  setInterval(() => {
    if (connectedDevices.some(d => d.status === 'connected')) {
      const data = getDemoSensorData();
      data.source = 'live';
      data.deviceId = 'esp32_field1';
      
      cacheSensorData(data);

      const message: ESP32Message = {
        type: 'sensor_data',
        deviceId: 'esp32_field1',
        payload: data,
        timestamp: new Date()
      };
      messageHandlers.forEach(h => h(message));
    }
  }, 30000); // Every 30 seconds
}

// ============================================
// SEND COMMAND TO ESP32
// ============================================

export async function sendCommandToESP32(
  deviceId: string,
  command: 'start_irrigation' | 'stop_irrigation' | 'get_status' | 'calibrate',
  params?: any
): Promise<{ success: boolean; message: string }> {
  const device = connectedDevices.find(d => d.id === deviceId);
  
  if (!device || device.status !== 'connected') {
    return {
      success: false,
      message: 'Device not connected. Kripya device connection check karein.'
    };
  }

  // Simulate command execution
  return new Promise((resolve) => {
    setTimeout(() => {
      const response: ESP32Message = {
        type: 'command_response',
        deviceId,
        payload: { command, success: true, params },
        timestamp: new Date()
      };
      messageHandlers.forEach(h => h(response));

      resolve({
        success: true,
        message: `Command "${command}" successfully sent to ${device.name}.`
      });
    }, 500);
  });
}

// ============================================
// SYNC STATUS
// ============================================

export interface SyncStatus {
  lastSync: Date | null;
  pendingUpdates: number;
  isOnline: boolean;
  syncErrors: string[];
}

let syncStatus: SyncStatus = {
  lastSync: null,
  pendingUpdates: 0,
  isOnline: navigator.onLine,
  syncErrors: []
};

export function getSyncStatus(): SyncStatus {
  return { ...syncStatus, isOnline: navigator.onLine };
}

export function updateSyncStatus(updates: Partial<SyncStatus>): void {
  syncStatus = { ...syncStatus, ...updates };
}

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncStatus.isOnline = true;
  });
  window.addEventListener('offline', () => {
    syncStatus.isOnline = false;
  });
}

// ============================================
// INITIALIZE SERVICE
// ============================================

export function initializeSensorService(): void {
  // Load cached data
  getFarmContext();
  getSensorData();
  
  // Start ESP32 simulation (for demo)
  simulateESP32Connection();
  
  console.log('🌱 AgriGuard Sensor Service initialized');
}
