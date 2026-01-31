// AgriGuard Offline AI Engine - Type Definitions

export type Intent =
    | 'ASK_TEMPERATURE'
    | 'ASK_HUMIDITY'
    | 'ASK_SOIL_MOISTURE'
    | 'ASK_WEATHER'
    | 'ASK_IRRIGATION'
    | 'ASK_FERTILIZER'
    | 'ASK_CROP_HEALTH'
    | 'ASK_WATER_AMOUNT'
    | 'ASK_ALERTS'
    | 'GREETING'
    | 'THANKS'
    | 'HELP'
    | 'UNKNOWN'
    // Navigation Intents
    | 'NAV_DASHBOARD'
    | 'NAV_IRRIGATION'
    | 'NAV_ALERTS'
    | 'NAV_ASSISTANT';

export interface IntentResult {
    intent: Intent;
    confidence: number;
    entities: {
        crop?: string;
        stage?: string;
        value?: number;
    };
    rawInput: string;
    // Navigation target if applicable
    navigationTarget?: 'DASHBOARD' | 'IRRIGATION' | 'ALERTS' | 'ASSISTANT';
}

export interface SensorData {
    soilMoisture: number;      // 0-100%
    temperature: number;       // °C
    humidity: number;          // 0-100%
    isRaining: boolean;
    lastUpdated: string;
}

export interface WeatherData {
    currentTemp: number;
    forecastTemp: number;
    rainfall: number;          // mm
    rainProbability: number;   // 0-100%
    condition: 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy';
    forecast: string;
}

export interface CropData {
    type: 'wheat' | 'rice' | 'cotton';
    stage: 'sowing' | 'vegetative' | 'flowering' | 'harvesting';
    plantedDate: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface AIResponse {
    text: string;
    hindiText: string;
    action?: 'irrigate' | 'stop' | 'reduce' | 'wait' | 'fertilize' | 'alert';
    value?: number;
    unit?: string;
    confidence: number;
    dataUsed: string[];
}

// Crop coefficient (Kc) values from FAO + ICAR combined dataset
export interface CropCoefficients {
    initial: number;
    mid: number;
    end: number;
}

export const CROP_KC_VALUES: Record<string, CropCoefficients> = {
    wheat: { initial: 0.4, mid: 1.15, end: 0.4 },
    rice: { initial: 1.05, mid: 1.2, end: 0.9 },
    cotton: { initial: 0.35, mid: 1.2, end: 0.5 },
};

// Optimal moisture ranges by crop (% field capacity)
export const OPTIMAL_MOISTURE: Record<string, { min: number; max: number; critical: number }> = {
    wheat: { min: 40, max: 70, critical: 25 },
    rice: { min: 80, max: 100, critical: 60 },
    cotton: { min: 35, max: 65, critical: 20 },
};

// Fertilizer recommendations from ICAR guidelines
export interface FertilizerRec {
    type: string;
    quantity: string;
    timing: string;
    reason: string;
}

export const FERTILIZER_DATA: Record<string, Record<string, FertilizerRec>> = {
    wheat: {
        sowing: {
            type: 'DAP (Diammonium Phosphate)',
            quantity: '50 kg/acre',
            timing: 'Sowing ke time',
            reason: 'Root development ke liye phosphorus zaroori hai',
        },
        vegetative: {
            type: 'Urea',
            quantity: '40 kg/acre',
            timing: 'Sowing ke 20-25 din baad',
            reason: 'Nitrogen se patti aur tana achhe se badhte hain',
        },
        flowering: {
            type: 'MOP (Muriate of Potash)',
            quantity: '25 kg/acre',
            timing: 'Flowering start hone par',
            reason: 'Potash se daana bhari hota hai',
        },
        harvesting: {
            type: 'Koi nahi',
            quantity: '0 kg',
            timing: 'N/A',
            reason: 'Harvesting stage mein fertilizer nahi chahiye',
        },
    },
    rice: {
        sowing: {
            type: 'DAP',
            quantity: '60 kg/acre',
            timing: 'Transplanting ke time',
            reason: 'Seedling establishment ke liye',
        },
        vegetative: {
            type: 'Urea',
            quantity: '50 kg/acre',
            timing: 'Transplanting ke 3-4 hafte baad',
            reason: 'Tillers badhane ke liye nitrogen',
        },
        flowering: {
            type: 'MOP',
            quantity: '30 kg/acre',
            timing: 'Panicle initiation par',
            reason: 'Grain filling ke liye potassium',
        },
        harvesting: {
            type: 'Koi nahi',
            quantity: '0 kg',
            timing: 'N/A',
            reason: 'Harvest ke time fertilizer nahi dena',
        },
    },
    cotton: {
        sowing: {
            type: 'DAP',
            quantity: '45 kg/acre',
            timing: 'Sowing ke time',
            reason: 'Root growth ke liye phosphorus',
        },
        vegetative: {
            type: 'Urea',
            quantity: '45 kg/acre',
            timing: 'Sowing ke 30-35 din baad',
            reason: 'Vegetative growth ke liye nitrogen boost',
        },
        flowering: {
            type: 'MOP + Borax',
            quantity: '35 kg MOP + 2 kg Borax/acre',
            timing: 'Square formation par',
            reason: 'Boll formation aur retention ke liye',
        },
        harvesting: {
            type: 'Koi nahi',
            quantity: '0 kg',
            timing: 'N/A',
            reason: 'Picking stage mein fertilizer nahi',
        },
    },
};
