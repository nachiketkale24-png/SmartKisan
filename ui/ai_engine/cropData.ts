/**
 * AgriGuard Offline AI Engine - Crop Dataset
 * Combined FAO + ICAR India Agricultural Data
 * Crops: Wheat, Rice, Cotton
 * 
 * Data Sources:
 * - FAO Irrigation and Drainage Paper 56 (Kc values)
 * - ICAR Crop Production Guidelines
 * - Indian Agricultural Research Institute recommendations
 */

// ============================================
// TYPES
// ============================================

export type CropType = 'wheat' | 'rice' | 'cotton';
export type GrowthStage = 'initial' | 'development' | 'mid' | 'late';
export type SoilType = 'sandy' | 'loamy' | 'clayey' | 'black';

export interface CropStageData {
  stage: GrowthStage;
  daysRange: [number, number];
  kc: number; // Crop coefficient for ETc calculation
  rootDepth: number; // cm
  mad: number; // Maximum Allowable Depletion (%)
  description: {
    en: string;
    hi: string;
  };
}

export interface CropData {
  name: {
    en: string;
    hi: string;
  };
  scientificName: string;
  totalDuration: number; // days
  optimalMoisture: { min: number; max: number };
  criticalMoisture: number; // Below this = stress
  waterlogThreshold: number; // Above this = waterlogging risk
  stages: CropStageData[];
  waterRequirement: {
    total: number; // mm for entire season
    peak: number; // mm/day at peak
  };
  temperatureRange: {
    min: number;
    optimal: { min: number; max: number };
    max: number;
  };
}

export interface FertilizerSchedule {
  stage: GrowthStage;
  daysAfterSowing: number;
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  application: {
    en: string;
    hi: string;
  };
  tips: {
    en: string;
    hi: string;
  };
}

export interface SoilData {
  type: SoilType;
  name: {
    en: string;
    hi: string;
  };
  fieldCapacity: number; // %
  wiltingPoint: number; // %
  infiltrationRate: number; // mm/hr
  waterHoldingCapacity: number; // mm/m
}

// ============================================
// CROP DATABASE (FAO + ICAR Combined)
// ============================================

export const CROP_DATABASE: Record<CropType, CropData> = {
  wheat: {
    name: { en: 'Wheat', hi: 'गेहूं' },
    scientificName: 'Triticum aestivum',
    totalDuration: 120,
    optimalMoisture: { min: 50, max: 70 },
    criticalMoisture: 35,
    waterlogThreshold: 85,
    stages: [
      {
        stage: 'initial',
        daysRange: [0, 20],
        kc: 0.4,
        rootDepth: 15,
        mad: 50,
        description: {
          en: 'Germination & Seedling',
          hi: 'अंकुरण और पौध अवस्था'
        }
      },
      {
        stage: 'development',
        daysRange: [21, 50],
        kc: 0.8,
        rootDepth: 30,
        mad: 50,
        description: {
          en: 'Tillering & Crown Root',
          hi: 'कल्ले निकलना'
        }
      },
      {
        stage: 'mid',
        daysRange: [51, 90],
        kc: 1.15,
        rootDepth: 60,
        mad: 55,
        description: {
          en: 'Heading & Flowering',
          hi: 'बाली निकलना और फूल आना'
        }
      },
      {
        stage: 'late',
        daysRange: [91, 120],
        kc: 0.4,
        rootDepth: 60,
        mad: 60,
        description: {
          en: 'Grain Filling & Maturity',
          hi: 'दाना भरना और पकना'
        }
      }
    ],
    waterRequirement: {
      total: 450, // mm
      peak: 6.5 // mm/day
    },
    temperatureRange: {
      min: 4,
      optimal: { min: 20, max: 25 },
      max: 35
    }
  },

  rice: {
    name: { en: 'Rice (Paddy)', hi: 'धान' },
    scientificName: 'Oryza sativa',
    totalDuration: 135,
    optimalMoisture: { min: 70, max: 100 }, // Flooded conditions
    criticalMoisture: 60,
    waterlogThreshold: 100, // Rice tolerates waterlogging
    stages: [
      {
        stage: 'initial',
        daysRange: [0, 30],
        kc: 1.1,
        rootDepth: 20,
        mad: 20,
        description: {
          en: 'Nursery & Transplanting',
          hi: 'नर्सरी और रोपाई'
        }
      },
      {
        stage: 'development',
        daysRange: [31, 60],
        kc: 1.2,
        rootDepth: 30,
        mad: 20,
        description: {
          en: 'Tillering',
          hi: 'कल्ले फूटना'
        }
      },
      {
        stage: 'mid',
        daysRange: [61, 100],
        kc: 1.2,
        rootDepth: 40,
        mad: 20,
        description: {
          en: 'Panicle & Flowering',
          hi: 'बाली निकलना और फूल'
        }
      },
      {
        stage: 'late',
        daysRange: [101, 135],
        kc: 0.9,
        rootDepth: 40,
        mad: 30,
        description: {
          en: 'Grain Fill & Maturity',
          hi: 'दाना भरना और पकाव'
        }
      }
    ],
    waterRequirement: {
      total: 1200, // mm (including standing water)
      peak: 8 // mm/day
    },
    temperatureRange: {
      min: 15,
      optimal: { min: 25, max: 32 },
      max: 40
    }
  },

  cotton: {
    name: { en: 'Cotton', hi: 'कपास' },
    scientificName: 'Gossypium hirsutum',
    totalDuration: 180,
    optimalMoisture: { min: 45, max: 65 },
    criticalMoisture: 30,
    waterlogThreshold: 75,
    stages: [
      {
        stage: 'initial',
        daysRange: [0, 30],
        kc: 0.45,
        rootDepth: 20,
        mad: 65,
        description: {
          en: 'Emergence & Seedling',
          hi: 'अंकुरण और पौध'
        }
      },
      {
        stage: 'development',
        daysRange: [31, 70],
        kc: 0.75,
        rootDepth: 50,
        mad: 65,
        description: {
          en: 'Vegetative Growth',
          hi: 'वानस्पतिक वृद्धि'
        }
      },
      {
        stage: 'mid',
        daysRange: [71, 130],
        kc: 1.15,
        rootDepth: 100,
        mad: 65,
        description: {
          en: 'Flowering & Boll Formation',
          hi: 'फूल और टिंडे बनना'
        }
      },
      {
        stage: 'late',
        daysRange: [131, 180],
        kc: 0.7,
        rootDepth: 100,
        mad: 70,
        description: {
          en: 'Boll Opening & Harvest',
          hi: 'टिंडे खुलना और कटाई'
        }
      }
    ],
    waterRequirement: {
      total: 700, // mm
      peak: 7 // mm/day
    },
    temperatureRange: {
      min: 15,
      optimal: { min: 25, max: 35 },
      max: 45
    }
  }
};

// ============================================
// FERTILIZER SCHEDULES (ICAR Recommendations)
// ============================================

export const FERTILIZER_SCHEDULES: Record<CropType, FertilizerSchedule[]> = {
  wheat: [
    {
      stage: 'initial',
      daysAfterSowing: 0,
      nitrogen: 60, // 50% of 120 kg/ha
      phosphorus: 60,
      potassium: 40,
      application: {
        en: 'Basal dose at sowing',
        hi: 'बुवाई के समय मूल खुराक'
      },
      tips: {
        en: 'Mix well with soil before sowing. Use DAP for phosphorus.',
        hi: 'बुवाई से पहले मिट्टी में अच्छी तरह मिलाएं। फास्फोरस के लिए DAP उपयोग करें।'
      }
    },
    {
      stage: 'development',
      daysAfterSowing: 21,
      nitrogen: 30, // First top dressing
      phosphorus: 0,
      potassium: 0,
      application: {
        en: 'First top dressing at tillering',
        hi: 'कल्ले फूटने पर पहली टॉप ड्रेसिंग'
      },
      tips: {
        en: 'Apply urea after light irrigation. Avoid waterlogging.',
        hi: 'हल्की सिंचाई के बाद यूरिया डालें। जलभराव से बचें।'
      }
    },
    {
      stage: 'mid',
      daysAfterSowing: 45,
      nitrogen: 30, // Second top dressing
      phosphorus: 0,
      potassium: 0,
      application: {
        en: 'Second top dressing before heading',
        hi: 'बाली निकलने से पहले दूसरी टॉप ड्रेसिंग'
      },
      tips: {
        en: 'Critical for grain development. Ensure adequate moisture.',
        hi: 'दाने के विकास के लिए महत्वपूर्ण। पर्याप्त नमी सुनिश्चित करें।'
      }
    }
  ],

  rice: [
    {
      stage: 'initial',
      daysAfterSowing: 0,
      nitrogen: 40, // 33% of 120 kg/ha
      phosphorus: 60,
      potassium: 40,
      application: {
        en: 'Basal before transplanting',
        hi: 'रोपाई से पहले मूल खुराक'
      },
      tips: {
        en: 'Incorporate in puddled soil. Drain field before applying.',
        hi: 'कीचड़ वाली मिट्टी में मिलाएं। डालने से पहले पानी निकालें।'
      }
    },
    {
      stage: 'development',
      daysAfterSowing: 21,
      nitrogen: 40,
      phosphorus: 0,
      potassium: 0,
      application: {
        en: 'First top dressing at active tillering',
        hi: 'सक्रिय कल्ले फूटने पर पहली टॉप ड्रेसिंग'
      },
      tips: {
        en: 'Maintain 2-3 cm standing water. Apply in evening.',
        hi: '2-3 सेमी खड़ा पानी रखें। शाम को डालें।'
      }
    },
    {
      stage: 'mid',
      daysAfterSowing: 45,
      nitrogen: 40,
      phosphorus: 0,
      potassium: 20,
      application: {
        en: 'Second dose at panicle initiation',
        hi: 'बाली निकलने पर दूसरी खुराक'
      },
      tips: {
        en: 'Most critical stage. Add potash for grain quality.',
        hi: 'सबसे महत्वपूर्ण अवस्था। दाने की गुणवत्ता के लिए पोटाश डालें।'
      }
    }
  ],

  cotton: [
    {
      stage: 'initial',
      daysAfterSowing: 0,
      nitrogen: 20,
      phosphorus: 60,
      potassium: 60,
      application: {
        en: 'Basal dose at sowing',
        hi: 'बुवाई के समय मूल खुराक'
      },
      tips: {
        en: 'Place 5cm away from seed. Avoid direct contact.',
        hi: 'बीज से 5 सेमी दूर रखें। सीधे संपर्क से बचें।'
      }
    },
    {
      stage: 'development',
      daysAfterSowing: 30,
      nitrogen: 40,
      phosphorus: 0,
      potassium: 0,
      application: {
        en: 'First top dressing at squaring',
        hi: 'स्क्वेयरिंग पर पहली टॉप ड्रेसिंग'
      },
      tips: {
        en: 'Apply in ring around plant. Irrigate after application.',
        hi: 'पौधे के चारों ओर रिंग में डालें। डालने के बाद सिंचाई करें।'
      }
    },
    {
      stage: 'mid',
      daysAfterSowing: 60,
      nitrogen: 40,
      phosphorus: 0,
      potassium: 0,
      application: {
        en: 'Second dose at flowering',
        hi: 'फूल आने पर दूसरी खुराक'
      },
      tips: {
        en: 'Critical for boll development. Avoid excess N at this stage.',
        hi: 'टिंडे के विकास के लिए महत्वपूर्ण। इस अवस्था में अधिक N से बचें।'
      }
    },
    {
      stage: 'mid',
      daysAfterSowing: 90,
      nitrogen: 20,
      phosphorus: 0,
      potassium: 0,
      application: {
        en: 'Third dose at boll formation',
        hi: 'टिंडे बनने पर तीसरी खुराक'
      },
      tips: {
        en: 'Light dose only. Focus on pest management.',
        hi: 'केवल हल्की खुराक। कीट प्रबंधन पर ध्यान दें।'
      }
    }
  ]
};

// ============================================
// SOIL DATABASE
// ============================================

export const SOIL_DATABASE: Record<SoilType, SoilData> = {
  sandy: {
    type: 'sandy',
    name: { en: 'Sandy Soil', hi: 'बलुई मिट्टी' },
    fieldCapacity: 15,
    wiltingPoint: 5,
    infiltrationRate: 50, // mm/hr
    waterHoldingCapacity: 100 // mm/m
  },
  loamy: {
    type: 'loamy',
    name: { en: 'Loamy Soil', hi: 'दोमट मिट्टी' },
    fieldCapacity: 30,
    wiltingPoint: 12,
    infiltrationRate: 25,
    waterHoldingCapacity: 180
  },
  clayey: {
    type: 'clayey',
    name: { en: 'Clayey Soil', hi: 'चिकनी मिट्टी' },
    fieldCapacity: 45,
    wiltingPoint: 22,
    infiltrationRate: 8,
    waterHoldingCapacity: 230
  },
  black: {
    type: 'black',
    name: { en: 'Black Cotton Soil', hi: 'काली मिट्टी' },
    fieldCapacity: 50,
    wiltingPoint: 25,
    infiltrationRate: 5,
    waterHoldingCapacity: 250
  }
};

// ============================================
// REFERENCE EVAPOTRANSPIRATION (ETo) BY MONTH
// Based on IMD India average data
// ============================================

export const MONTHLY_ETO: Record<number, number> = {
  1: 2.5,  // January
  2: 3.2,  // February
  3: 4.5,  // March
  4: 5.8,  // April
  5: 6.5,  // May
  6: 5.5,  // June (monsoon starts)
  7: 4.2,  // July
  8: 4.0,  // August
  9: 4.5,  // September
  10: 4.2, // October
  11: 3.0, // November
  12: 2.3  // December
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCurrentStage(cropType: CropType, daysAfterSowing: number): CropStageData | null {
  const crop = CROP_DATABASE[cropType];
  if (!crop) return null;
  
  for (const stage of crop.stages) {
    if (daysAfterSowing >= stage.daysRange[0] && daysAfterSowing <= stage.daysRange[1]) {
      return stage;
    }
  }
  return crop.stages[crop.stages.length - 1]; // Return last stage if beyond
}

export function getNextFertilizerSchedule(
  cropType: CropType,
  daysAfterSowing: number
): FertilizerSchedule | null {
  const schedules = FERTILIZER_SCHEDULES[cropType];
  if (!schedules) return null;
  
  for (const schedule of schedules) {
    if (schedule.daysAfterSowing >= daysAfterSowing) {
      return schedule;
    }
  }
  return null;
}

export function getCropNames(): { type: CropType; en: string; hi: string }[] {
  return Object.entries(CROP_DATABASE).map(([type, data]) => ({
    type: type as CropType,
    en: data.name.en,
    hi: data.name.hi
  }));
}
