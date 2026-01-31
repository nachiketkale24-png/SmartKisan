/**
 * AgriGuard Frontend - Assistant API Service
 * Handles all communication with the backend AI service
 * 
 * This is the ONLY file that communicates with the backend.
 * All other frontend components should use this service.
 */

// ============================================
// CONFIGURATION
// ============================================

// Dynamic API URL - works on mobile too!
// Uses same host as frontend but port 3002
const getApiBaseUrl = () => {
  // @ts-ignore - Vite environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For mobile/network access - use same host as frontend
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${currentHost}:3002/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Offline response cache
const offlineCache = new Map<string, any>();

// ============================================
// TYPES
// ============================================

export interface AssistantResponse {
  reply: string;
  intent: string;
  confidence: number;
  usedData: {
    sensorData: {
      soilMoisture: number;
      temperature: number;
      humidity: number;
    };
    farmContext: {
      cropType: string;
      daysAfterSowing: number;
      soilType: string;
    };
  };
  action?: string;
  data?: any;
  timestamp: string;
  offline?: boolean;  // Added for offline responses
}

export interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  lastUpdated: string;
}

export interface FarmContext {
  cropType: string;
  daysAfterSowing: number;
  soilType: string;
  fieldArea?: number;
  location?: string;
}

export interface QuickCommand {
  command: string;
  intent: string;
  icon: string;
}

export interface SystemStatus {
  status: string;
  ai: {
    status: string;
    mode: string;
    crops: string[];
    language: string;
  };
  sensors: {
    status: string;
    lastUpdate: string;
  };
  devices: {
    connected: number;
    online: number;
  };
}

// ============================================
// API SERVICE CLASS
// ============================================

class AssistantAPIService {
  private baseUrl: string;
  private isOnline: boolean = true;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.checkConnectivity();
  }

  // ============================================
  // CONNECTIVITY CHECK
  // ============================================

  private async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      this.isOnline = response.ok;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Check if backend is reachable
   */
  async ping(): Promise<boolean> {
    return this.checkConnectivity();
  }

  // ============================================
  // ASSISTANT QUERIES
  // ============================================

  /**
   * Send a query to the AI assistant
   * Main method for voice/text interactions
   */
  async sendQuery(message: string, context?: Partial<FarmContext & SensorData>): Promise<AssistantResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          context
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      offlineCache.set(message.toLowerCase().trim(), data);
      
      return data;
    } catch (error) {
      console.error('Assistant query failed:', error);
      
      // Try to return cached response
      const cached = this.getCachedResponse(message);
      if (cached) {
        return { ...cached, offline: true };
      }

      // Return error response
      return {
        reply: 'Backend se connection nahi ho pa raha. Kripya check karein ki server chal raha hai.',
        intent: 'error',
        confidence: 0,
        usedData: {
          sensorData: { soilMoisture: 0, temperature: 0, humidity: 0 },
          farmContext: { cropType: 'unknown', daysAfterSowing: 0, soilType: 'unknown' }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available quick commands
   */
  async getQuickCommands(): Promise<QuickCommand[]> {
    try {
      const response = await fetch(`${this.baseUrl}/assistant/commands`);
      const data = await response.json();
      return data.commands || [];
    } catch (error) {
      console.error('Failed to get commands:', error);
      // Return default commands
      return [
        { command: 'Paani dena hai kya?', intent: 'irrigation_check', icon: '💧' },
        { command: 'Khad ki salah do', intent: 'fertilizer_advice', icon: '🌿' },
        { command: 'Mausam kaisa hai?', intent: 'weather_check', icon: '🌤️' },
        { command: 'Madad chahiye', intent: 'help', icon: '🆘' }
      ];
    }
  }

  // ============================================
  // SENSOR DATA
  // ============================================

  /**
   * Get current sensor readings
   */
  async getSensorData(): Promise<{ sensors: SensorData; farm: FarmContext } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sensors`);
      if (!response.ok) throw new Error('Failed to fetch sensors');
      return await response.json();
    } catch (error) {
      console.error('Failed to get sensor data:', error);
      return null;
    }
  }

  /**
   * Update farm context
   */
  async updateFarmContext(context: Partial<FarmContext>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sensors/farm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to update farm context:', error);
      return false;
    }
  }

  /**
   * Trigger demo sensor data update
   */
  async generateDemoData(): Promise<SensorData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sensors/demo`, {
        method: 'POST'
      });
      const data = await response.json();
      return data.sensors;
    } catch (error) {
      console.error('Failed to generate demo data:', error);
      return null;
    }
  }

  // ============================================
  // SYSTEM STATUS
  // ============================================

  /**
   * Get system health status
   */
  async getSystemStatus(): Promise<SystemStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      return await response.json();
    } catch (error) {
      console.error('Failed to get system status:', error);
      return null;
    }
  }

  // ============================================
  // OFFLINE SUPPORT
  // ============================================

  private getCachedResponse(message: string): AssistantResponse | null {
    const key = message.toLowerCase().trim();
    
    // Check exact match
    if (offlineCache.has(key)) {
      return offlineCache.get(key);
    }

    // Check partial matches for common queries
    for (const [cachedKey, cachedValue] of offlineCache.entries()) {
      if (key.includes(cachedKey) || cachedKey.includes(key)) {
        return cachedValue;
      }
    }

    return null;
  }

  /**
   * Check if service is online
   */
  isServiceOnline(): boolean {
    return this.isOnline;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const assistantAPI = new AssistantAPIService();

// Also export the class for testing
export default AssistantAPIService;
