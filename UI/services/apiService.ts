// AgriGuard API Service - REST API Integration
// Connects to backend with offline fallback

import { AgriGuardAI } from '../ai_engine';

// API Configuration
const API_CONFIG = {
    // Use LAN IP for mobile access - change this to your server IP
    baseUrl: process.env.VITE_API_URL || 'http://192.168.1.205:3002/api',
    timeout: 10000,
    retries: 2,
};

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: string;
    type?: 'irrigation' | 'fertilizer' | 'weather' | 'health' | 'alert' | 'general';
    data?: any;
}

export interface APIResponse {
    success: boolean;
    message: string;
    data?: any;
    offline?: boolean;
}

export interface IrrigationAPIResponse extends APIResponse {
    data: {
        shouldIrrigate: boolean;
        waterAmount: number;
        reason: string;
        urgency: string;
    };
}

class APIService {
    private isOnline: boolean = true;
    private pendingRequests: any[] = [];

    constructor() {
        // Monitor online status
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('[APIService] Online');
            this.syncPendingRequests();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('[APIService] Offline');
        });
    }

    // Check connection status
    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000),
            });
            this.isOnline = response.ok;
            return this.isOnline;
        } catch {
            this.isOnline = false;
            return false;
        }
    }

    // Generic API call with retry
    private async apiCall<T>(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<T & { offline?: boolean }> {
        const url = `${API_CONFIG.baseUrl}${endpoint}`;
        
        for (let attempt = 0; attempt <= API_CONFIG.retries; attempt++) {
            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: body ? JSON.stringify(body) : undefined,
                    signal: AbortSignal.timeout(API_CONFIG.timeout),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                this.isOnline = true;
                return { ...data, offline: false };
            } catch (error) {
                console.warn(`[APIService] Attempt ${attempt + 1} failed:`, error);
                if (attempt === API_CONFIG.retries) {
                    // Use offline fallback
                    this.isOnline = false;
                    return this.getOfflineFallback<T>(endpoint, body);
                }
            }
        }

        return this.getOfflineFallback<T>(endpoint, body);
    }

    // Offline fallback using local AI engine
    private getOfflineFallback<T>(endpoint: string, body?: any): T & { offline: boolean } {
        console.log('[APIService] Using offline fallback for:', endpoint);
        
        // Route to local AI engine
        if (endpoint.includes('/chat') || endpoint.includes('/query')) {
            const response = AgriGuardAI.chat(body?.message || body?.query || '');
            return {
                success: true,
                message: response,
                offline: true,
            } as unknown as T & { offline: boolean };
        }

        if (endpoint.includes('/irrigation')) {
            const decision = AgriGuardAI.getIrrigationAdvice();
            return {
                success: true,
                data: decision,
                offline: true,
            } as unknown as T & { offline: boolean };
        }

        if (endpoint.includes('/fertilizer')) {
            const advice = AgriGuardAI.getFertilizerAdvice();
            return {
                success: true,
                data: advice,
                offline: true,
            } as unknown as T & { offline: boolean };
        }

        if (endpoint.includes('/sensors')) {
            const sensors = AgriGuardAI.getSensorData();
            return {
                success: true,
                data: sensors,
                offline: true,
            } as unknown as T & { offline: boolean };
        }

        if (endpoint.includes('/weather')) {
            const weather = AgriGuardAI.getWeatherData();
            return {
                success: true,
                data: weather,
                offline: true,
            } as unknown as T & { offline: boolean };
        }

        // Default fallback
        return {
            success: true,
            message: 'Offline mode active. Using local data.',
            offline: true,
        } as unknown as T & { offline: boolean };
    }

    // ============================================
    // CHAT API
    // ============================================
    
    async sendChatMessage(message: string): Promise<APIResponse> {
        // Always use local AI engine for now (hackathon demo)
        const response = AgriGuardAI.chat(message);
        const aiResponse = AgriGuardAI.generateResponse(message);
        
        return {
            success: true,
            message: response,
            data: {
                hindiText: aiResponse.hindiText,
                englishText: aiResponse.text,
                action: aiResponse.action,
                value: aiResponse.value,
                unit: aiResponse.unit,
                confidence: aiResponse.confidence,
                dataUsed: aiResponse.dataUsed,
            },
            offline: !this.isOnline,
        };
    }

    // ============================================
    // IRRIGATION API
    // ============================================
    
    async getIrrigationAdvice(): Promise<IrrigationAPIResponse> {
        const decision = AgriGuardAI.getIrrigationAdvice();
        return {
            success: true,
            message: decision.hindiReason,
            data: {
                shouldIrrigate: decision.shouldIrrigate,
                waterAmount: decision.waterAmount,
                reason: decision.hindiReason,
                urgency: decision.urgency,
            },
            offline: !this.isOnline,
        };
    }

    // ============================================
    // SENSOR API
    // ============================================
    
    async getSensorData(): Promise<APIResponse> {
        const sensors = AgriGuardAI.getSensorData();
        return {
            success: true,
            message: 'Sensor data retrieved',
            data: sensors,
            offline: !this.isOnline,
        };
    }

    async updateSensorData(data: any): Promise<APIResponse> {
        AgriGuardAI.updateSensorData(data);
        return {
            success: true,
            message: 'Sensor data updated',
            offline: !this.isOnline,
        };
    }

    // ============================================
    // WEATHER API
    // ============================================
    
    async getWeatherData(): Promise<APIResponse> {
        const weather = AgriGuardAI.getWeatherData();
        return {
            success: true,
            message: 'Weather data retrieved',
            data: weather,
            offline: !this.isOnline,
        };
    }

    // ============================================
    // ALERTS API
    // ============================================
    
    async getAlerts(): Promise<APIResponse> {
        const alerts = AgriGuardAI.checkAlerts();
        return {
            success: true,
            message: alerts.length > 0 ? `${alerts.length} alerts active` : 'No alerts',
            data: alerts,
            offline: !this.isOnline,
        };
    }

    // ============================================
    // SYNC API
    // ============================================
    
    private async syncPendingRequests(): Promise<void> {
        if (this.pendingRequests.length === 0) return;
        
        console.log('[APIService] Syncing pending requests:', this.pendingRequests.length);
        
        for (const request of this.pendingRequests) {
            try {
                await this.apiCall(request.endpoint, request.method, request.body);
            } catch (error) {
                console.error('[APIService] Sync failed:', error);
            }
        }
        
        this.pendingRequests = [];
    }

    // Get connection status
    getIsOnline(): boolean {
        return this.isOnline;
    }
}

// Singleton instance
export const apiService = new APIService();
export default apiService;
