// AgriGuard Fertilizer Engine - ICAR-based Recommendations

import { CropData, FERTILIZER_DATA, FertilizerRec } from './types';
import { getCropData } from './localDataStore';

export interface FertilizerDecision {
    recommended: boolean;
    fertilizer: FertilizerRec;
    hindiResponse: string;
    nextApplication: string;
    warnings: string[];
}

// ============================================
// MAIN FERTILIZER RECOMMENDATION ENGINE
// ============================================
export const getFertilizerRecommendation = (
    crop?: CropData
): FertilizerDecision => {
    const cropData = crop || getCropData();
    
    console.log('[FertilizerEngine] Input:', cropData);
    
    const cropFertilizers = FERTILIZER_DATA[cropData.type];
    if (!cropFertilizers) {
        return {
            recommended: false,
            fertilizer: {
                type: 'NPK Complex (10:26:26)',
                quantity: '40 kg/acre',
                timing: 'General use',
                reason: 'Standard balanced fertilizer for unknown crop',
            },
            hindiResponse: 'Aapki fasal ke liye NPK Complex 40 kg/acre recommended hai.',
            nextApplication: '3-4 hafte baad',
            warnings: [],
        };
    }
    
    const stageFertilizer = cropFertilizers[cropData.stage];
    if (!stageFertilizer) {
        return {
            recommended: false,
            fertilizer: cropFertilizers.vegetative,
            hindiResponse: 'Is stage ki specific recommendation available nahi hai. General advice follow karein.',
            nextApplication: 'Growth stage ke hisaab se',
            warnings: [],
        };
    }
    
    // Build Hinglish response
    const cropNames: Record<string, string> = {
        wheat: 'Gehun',
        rice: 'Dhan',
        cotton: 'Kapas',
    };
    
    const stageNames: Record<string, string> = {
        sowing: 'buwai',
        vegetative: 'vegetative growth',
        flowering: 'flowering',
        harvesting: 'harvesting',
    };
    
    const cropHindi = cropNames[cropData.type] || cropData.type;
    const stageHindi = stageNames[cropData.stage] || cropData.stage;
    
    let hindiResponse = '';
    const warnings: string[] = [];
    
    if (stageFertilizer.type === 'Koi nahi') {
        hindiResponse = `${cropHindi} ke ${stageHindi} stage mein fertilizer dene ki zaroorat nahi hai. Harvesting ke time khad nahi deni chahiye.`;
    } else {
        hindiResponse = `${cropHindi} ke ${stageHindi} stage ke liye ${stageFertilizer.type} ${stageFertilizer.quantity} recommended hai. ${stageFertilizer.reason}. Fertilizer subah ya shaam mein dalein.`;
        
        // Add contextual warnings
        warnings.push('Fertilizer dalne ke baad halki sinchai zaroor karein.');
        if (cropData.stage === 'flowering') {
            warnings.push('Flowering stage mein zyada nitrogen avoid karein.');
        }
    }
    
    return {
        recommended: stageFertilizer.type !== 'Koi nahi',
        fertilizer: stageFertilizer,
        hindiResponse,
        nextApplication: getNextApplicationTime(cropData.stage),
        warnings,
    };
};

// ============================================
// NEXT APPLICATION TIMING
// ============================================
const getNextApplicationTime = (currentStage: string): string => {
    const timings: Record<string, string> = {
        sowing: '20-25 din baad (vegetative stage par)',
        vegetative: '25-30 din baad (flowering shuru hone par)',
        flowering: 'Is season mein aur fertilizer nahi',
        harvesting: 'Next season ke liye soil testing karwayein',
    };
    return timings[currentStage] || '3-4 hafte baad';
};

// ============================================
// SOIL TEST BASED RECOMMENDATION
// ============================================
export const getCustomFertilizerAdvice = (
    nitrogen: number,   // kg/ha available
    phosphorus: number, // kg/ha available  
    potassium: number,  // kg/ha available
    cropType: string
): string => {
    const deficiencies: string[] = [];
    const recommendations: string[] = [];
    
    // Standard requirements for wheat (can extend for other crops)
    const required = {
        wheat: { N: 120, P: 60, K: 40 },
        rice: { N: 100, P: 50, K: 50 },
        cotton: { N: 80, P: 40, K: 40 },
    };
    
    const req = required[cropType as keyof typeof required] || required.wheat;
    
    if (nitrogen < req.N * 0.5) {
        deficiencies.push('Nitrogen (N) ki kami hai');
        recommendations.push(`Urea ${Math.round((req.N - nitrogen) * 2.17)} kg/ha dalein`);
    }
    
    if (phosphorus < req.P * 0.5) {
        deficiencies.push('Phosphorus (P) ki kami hai');
        recommendations.push(`DAP ${Math.round((req.P - phosphorus) * 2.17)} kg/ha dalein`);
    }
    
    if (potassium < req.K * 0.5) {
        deficiencies.push('Potassium (K) ki kami hai');
        recommendations.push(`MOP ${Math.round((req.K - potassium) * 1.67)} kg/ha dalein`);
    }
    
    if (deficiencies.length === 0) {
        return 'Mitti mein sabhi nutrients sufficient hain. Standard dose follow karein.';
    }
    
    return `${deficiencies.join(', ')}. ${recommendations.join('. ')}.`;
};
