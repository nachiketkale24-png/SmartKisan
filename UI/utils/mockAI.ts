// Mock AI logic for offline hackathon demo

export interface IrrigationRecommendation {
    action: 'irrigate' | 'stop' | 'reduce';
    amount: number; // in mm
    reason: string;
    status: 'normal' | 'warning' | 'alert';
}

export interface FertilizerRecommendation {
    type: string;
    quantity: string;
    reason: string;
}

export interface SensorData {
    soilMoisture: number;
    temperature: number;
    isRaining: boolean;
}

// Irrigation decision logic
export const getIrrigationRecommendation = (data: SensorData): IrrigationRecommendation => {
    const { soilMoisture, temperature, isRaining } = data;

    // If raining, stop irrigation
    if (isRaining) {
        return {
            action: 'stop',
            amount: 0,
            reason: 'Baarish ho rahi hai. Irrigation band rakhein.',
            status: 'normal',
        };
    }

    // Over-irrigated
    if (soilMoisture > 80) {
        return {
            action: 'stop',
            amount: 0,
            reason: 'Soil moisture bahut zyada hai (>80%). Over-irrigation detected.',
            status: 'alert',
        };
    }

    // Optimal range
    if (soilMoisture >= 40 && soilMoisture <= 70) {
        return {
            action: 'stop',
            amount: 0,
            reason: 'Soil moisture optimal range mein hai. Aaj irrigation nahi chahiye.',
            status: 'normal',
        };
    }

    // Under-irrigated
    if (soilMoisture < 40) {
        const amount = temperature > 35 ? 25 : 15;
        return {
            action: 'irrigate',
            amount,
            reason: `Soil moisture kam hai (${soilMoisture}%). ${amount}mm paani dein.`,
            status: soilMoisture < 20 ? 'alert' : 'warning',
        };
    }

    // Slightly high, reduce
    return {
        action: 'reduce',
        amount: 10,
        reason: 'Soil moisture thoda zyada hai. Irrigation kam karein.',
        status: 'warning',
    };
};

// Fertilizer recommendation logic
export const getFertilizerRecommendation = (
    cropType: string,
    growthStage: string
): FertilizerRecommendation => {
    const recommendations: Record<string, Record<string, FertilizerRecommendation>> = {
        wheat: {
            sowing: { type: 'DAP', quantity: '50 kg/hectare', reason: 'Sowing stage pe phosphorus zaroori hai' },
            vegetative: { type: 'Urea', quantity: '40 kg/hectare', reason: 'Growth ke liye nitrogen chahiye' },
            flowering: { type: 'MOP', quantity: '25 kg/hectare', reason: 'Flowering stage pe potassium helpful hai' },
        },
        rice: {
            sowing: { type: 'DAP', quantity: '60 kg/hectare', reason: 'Rice seedlings ko phosphorus chahiye' },
            vegetative: { type: 'Urea', quantity: '50 kg/hectare', reason: 'Tillers ke liye nitrogen important hai' },
            flowering: { type: 'MOP', quantity: '30 kg/hectare', reason: 'Grain filling ke liye potassium zaroori' },
        },
        cotton: {
            sowing: { type: 'DAP', quantity: '45 kg/hectare', reason: 'Root development ke liye phosphorus' },
            vegetative: { type: 'Urea', quantity: '45 kg/hectare', reason: 'Plant growth ke liye nitrogen' },
            flowering: { type: 'MOP', quantity: '35 kg/hectare', reason: 'Boll formation ke liye potassium' },
        },
        sugarcane: {
            sowing: { type: 'DAP', quantity: '70 kg/hectare', reason: 'Heavy feeder crop, phosphorus zaroori' },
            vegetative: { type: 'Urea', quantity: '60 kg/hectare', reason: 'Cane elongation ke liye nitrogen' },
            flowering: { type: 'MOP', quantity: '40 kg/hectare', reason: 'Sugar content ke liye potassium' },
        },
    };

    const crop = cropType.toLowerCase();
    const stage = growthStage.toLowerCase();

    return recommendations[crop]?.[stage] || {
        type: 'NPK Complex',
        quantity: '40 kg/hectare',
        reason: 'General balanced fertilizer recommendation',
    };
};

// Chat response generator
export const generateChatResponse = (message: string): string => {
    const msg = message.toLowerCase();

    if (msg.includes('irrigate') || msg.includes('water') || msg.includes('paani')) {
        return 'Aaj irrigation nahi karein. Soil moisture 68% hai jo optimal range mein hai. Kal check karein.';
    }

    if (msg.includes('fertilizer') || msg.includes('khad')) {
        return 'Wheat ke liye abhi DAP 50kg/hectare recommended hai. Sowing stage ke liye yeh best hai.';
    }

    if (msg.includes('weather') || msg.includes('mausam')) {
        return 'Agle 3 din clear weather expected hai. Temperature 28-32°C rahega.';
    }

    if (msg.includes('moisture') || msg.includes('soil') || msg.includes('mitti')) {
        return 'Current soil moisture 68% hai. Yeh optimal range (40-70%) mein hai. Crop healthy hai.';
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('namaste')) {
        return 'Namaste! Main aapka farming assistant hoon. Irrigation, fertilizer, ya weather ke baare mein poochein.';
    }

    return 'Main samajh gaya. Kya aap irrigation, fertilizer, ya weather ke baare mein jaanna chahte hain?';
};
