/**
 * AgriGuard Offline AI Engine - Crop Health Diagnosis
 * Rule-based symptom detection + advice
 * 
 * Responds in Hinglish
 */

import { CropType, CROP_DATABASE } from './cropData';

// ============================================
// TYPES
// ============================================

export type SymptomType =
  | 'yellow_leaves'
  | 'brown_spots'
  | 'wilting'
  | 'curling_leaves'
  | 'white_powder'
  | 'holes_in_leaves'
  | 'stunted_growth'
  | 'root_rot'
  | 'stem_borer'
  | 'aphids'
  | 'no_symptoms';

export interface CropHealthInput {
  cropType: CropType;
  daysAfterSowing: number;
  symptoms: SymptomType[];
  soilMoisture?: number;
  temperature?: number;
  recentRain?: boolean;
}

export interface CropHealthOutput {
  overallHealth: 'healthy' | 'moderate' | 'poor' | 'critical';
  diagnosis: {
    condition: string;
    confidence: number; // 0-100
  };
  causes: {
    en: string[];
    hi: string[];
    hinglish: string[];
  };
  treatment: {
    en: string[];
    hi: string[];
    hinglish: string[];
  };
  prevention: {
    en: string[];
    hi: string[];
    hinglish: string[];
  };
  urgency: 'immediate' | 'soon' | 'monitor' | 'none';
}

// ============================================
// SYMPTOM DATABASE
// ============================================

interface SymptomRule {
  symptom: SymptomType;
  possibleCauses: {
    condition: string;
    confidence: number;
    triggers?: {
      highMoisture?: boolean;
      lowMoisture?: boolean;
      highTemp?: boolean;
      lowTemp?: boolean;
      recentRain?: boolean;
    };
  }[];
  description: {
    en: string;
    hi: string;
  };
}

const SYMPTOM_DATABASE: SymptomRule[] = [
  {
    symptom: 'yellow_leaves',
    possibleCauses: [
      { condition: 'nitrogen_deficiency', confidence: 70 },
      { condition: 'overwatering', confidence: 60, triggers: { highMoisture: true } },
      { condition: 'iron_deficiency', confidence: 50 },
      { condition: 'root_damage', confidence: 40 }
    ],
    description: {
      en: 'Yellowing of leaves (Chlorosis)',
      hi: 'पत्तियों का पीला पड़ना'
    }
  },
  {
    symptom: 'brown_spots',
    possibleCauses: [
      { condition: 'fungal_infection', confidence: 75, triggers: { highMoisture: true, recentRain: true } },
      { condition: 'bacterial_blight', confidence: 60 },
      { condition: 'potassium_deficiency', confidence: 45 },
      { condition: 'sunburn', confidence: 30, triggers: { highTemp: true } }
    ],
    description: {
      en: 'Brown spots on leaves',
      hi: 'पत्तियों पर भूरे धब्बे'
    }
  },
  {
    symptom: 'wilting',
    possibleCauses: [
      { condition: 'water_stress', confidence: 80, triggers: { lowMoisture: true } },
      { condition: 'root_rot', confidence: 60, triggers: { highMoisture: true } },
      { condition: 'bacterial_wilt', confidence: 50 },
      { condition: 'heat_stress', confidence: 70, triggers: { highTemp: true } }
    ],
    description: {
      en: 'Wilting or drooping plants',
      hi: 'पौधों का मुरझाना'
    }
  },
  {
    symptom: 'curling_leaves',
    possibleCauses: [
      { condition: 'viral_infection', confidence: 65 },
      { condition: 'aphid_attack', confidence: 70 },
      { condition: 'heat_stress', confidence: 55, triggers: { highTemp: true } },
      { condition: 'herbicide_damage', confidence: 40 }
    ],
    description: {
      en: 'Curling or rolling leaves',
      hi: 'पत्तियों का मुड़ना'
    }
  },
  {
    symptom: 'white_powder',
    possibleCauses: [
      { condition: 'powdery_mildew', confidence: 90 },
      { condition: 'downy_mildew', confidence: 70, triggers: { highMoisture: true } }
    ],
    description: {
      en: 'White powdery coating on leaves',
      hi: 'पत्तियों पर सफेद पाउडर'
    }
  },
  {
    symptom: 'holes_in_leaves',
    possibleCauses: [
      { condition: 'caterpillar_attack', confidence: 80 },
      { condition: 'beetle_damage', confidence: 70 },
      { condition: 'grasshopper', confidence: 50 }
    ],
    description: {
      en: 'Holes or eaten portions in leaves',
      hi: 'पत्तियों में छेद'
    }
  },
  {
    symptom: 'stunted_growth',
    possibleCauses: [
      { condition: 'nutrient_deficiency', confidence: 70 },
      { condition: 'root_nematode', confidence: 60 },
      { condition: 'viral_infection', confidence: 50 },
      { condition: 'waterlogging', confidence: 55, triggers: { highMoisture: true } }
    ],
    description: {
      en: 'Stunted or slow growth',
      hi: 'धीमी या रुकी हुई बढ़वार'
    }
  },
  {
    symptom: 'stem_borer',
    possibleCauses: [
      { condition: 'stem_borer_infestation', confidence: 90 }
    ],
    description: {
      en: 'Stem borer damage - dead heart',
      hi: 'तना छेदक - डेड हार्ट'
    }
  },
  {
    symptom: 'aphids',
    possibleCauses: [
      { condition: 'aphid_infestation', confidence: 95 }
    ],
    description: {
      en: 'Aphid clusters on plant',
      hi: 'पौधों पर माहू/चेपा'
    }
  }
];

// ============================================
// TREATMENT DATABASE
// ============================================

interface TreatmentInfo {
  condition: string;
  treatment: {
    en: string[];
    hi: string[];
    hinglish: string[];
  };
  prevention: {
    en: string[];
    hi: string[];
    hinglish: string[];
  };
  urgency: 'immediate' | 'soon' | 'monitor';
}

const TREATMENT_DATABASE: TreatmentInfo[] = [
  {
    condition: 'nitrogen_deficiency',
    treatment: {
      en: ['Apply 20-25 kg/ha Urea as foliar spray', 'Top dress with Urea after irrigation'],
      hi: ['20-25 kg/ha यूरिया का छिड़काव करें', 'सिंचाई के बाद यूरिया की टॉप ड्रेसिंग करें'],
      hinglish: ['20-25 kg Urea spray karein', 'Sinchai ke baad Urea top dressing karein']
    },
    prevention: {
      en: ['Apply balanced NPK fertilizer', 'Include legumes in crop rotation'],
      hi: ['संतुलित NPK उर्वरक का प्रयोग करें', 'फसल चक्र में दलहन शामिल करें'],
      hinglish: ['Balanced NPK fertilizer use karein', 'Crop rotation mein dal fasal lagayein']
    },
    urgency: 'soon'
  },
  {
    condition: 'fungal_infection',
    treatment: {
      en: ['Spray Mancozeb 2g/L or Copper oxychloride', 'Remove and destroy infected leaves'],
      hi: ['मैंकोज़ेब 2g/L या कॉपर ऑक्सीक्लोराइड का छिड़काव', 'संक्रमित पत्तियाँ हटा कर नष्ट करें'],
      hinglish: ['Mancozeb 2g/L ya Copper spray karein', 'Infected pattiyaan tod kar jalaa dein']
    },
    prevention: {
      en: ['Avoid overhead irrigation', 'Ensure proper plant spacing', 'Use disease-resistant varieties'],
      hi: ['ऊपर से पानी देने से बचें', 'पौधों में उचित दूरी रखें', 'रोग प्रतिरोधी किस्में लगाएं'],
      hinglish: ['Upar se paani dene se bachein', 'Paudhon mein sahi doori rakhein', 'Disease resistant variety lagayein']
    },
    urgency: 'immediate'
  },
  {
    condition: 'water_stress',
    treatment: {
      en: ['Irrigate immediately', 'Apply mulch to retain moisture'],
      hi: ['तुरंत सिंचाई करें', 'नमी बनाए रखने के लिए मल्चिंग करें'],
      hinglish: ['Turant sinchai karein', 'Mulching lagakar moisture bachayein']
    },
    prevention: {
      en: ['Install soil moisture sensors', 'Schedule regular irrigation', 'Use drip irrigation'],
      hi: ['मृदा नमी सेंसर लगाएं', 'नियमित सिंचाई करें', 'ड्रिप सिंचाई अपनाएं'],
      hinglish: ['Soil moisture sensor lagayein', 'Regular sinchai karein', 'Drip irrigation use karein']
    },
    urgency: 'immediate'
  },
  {
    condition: 'aphid_infestation',
    treatment: {
      en: ['Spray Imidacloprid 0.3ml/L or Neem oil 5ml/L', 'Release ladybugs (natural predator)'],
      hi: ['इमिडाक्लोप्रिड 0.3ml/L या नीम तेल 5ml/L का छिड़काव', 'लेडीबग छोड़ें (प्राकृतिक शत्रु)'],
      hinglish: ['Imidacloprid 0.3ml/L ya Neem tel 5ml/L spray karein', 'Ladybug chhodein - yeh aphid kha lete hain']
    },
    prevention: {
      en: ['Monitor crops regularly', 'Use yellow sticky traps', 'Avoid excess nitrogen'],
      hi: ['नियमित निरीक्षण करें', 'पीले चिपचिपे ट्रैप लगाएं', 'अधिक नाइट्रोजन से बचें'],
      hinglish: ['Regular check karte rahein', 'Yellow sticky trap lagayein', 'Zyada Nitrogen mat dein']
    },
    urgency: 'soon'
  },
  {
    condition: 'powdery_mildew',
    treatment: {
      en: ['Spray Sulphur 2g/L or Karathane', 'Apply milk spray (1:9 ratio with water)'],
      hi: ['सल्फर 2g/L या कैराथेन का छिड़काव', 'दूध का घोल (1:9 पानी के साथ) छिड़कें'],
      hinglish: ['Sulphur 2g/L ya Karathane spray karein', 'Doodh ka spray bhi kaam karta hai (1:9 paani)']
    },
    prevention: {
      en: ['Ensure good air circulation', 'Avoid evening irrigation', 'Use resistant varieties'],
      hi: ['हवा का अच्छा प्रवाह सुनिश्चित करें', 'शाम को सिंचाई से बचें', 'प्रतिरोधी किस्में लगाएं'],
      hinglish: ['Hawa ka flow achha rakhein', 'Shaam ko sinchai mat karein', 'Resistant variety lagayein']
    },
    urgency: 'soon'
  },
  {
    condition: 'stem_borer_infestation',
    treatment: {
      en: ['Apply Carbofuran granules in leaf whorl', 'Spray Chlorantraniliprole', 'Remove and destroy dead hearts'],
      hi: ['कार्बोफ्यूरान दाने पत्ती की गोभ में डालें', 'क्लोरेंट्रानिलीप्रोल का छिड़काव', 'डेड हार्ट निकाल कर नष्ट करें'],
      hinglish: ['Carbofuran granules patti ki gobh mein daalein', 'Dead heart nikal kar jalaa dein']
    },
    prevention: {
      en: ['Destroy crop residues', 'Use light traps', 'Early sowing'],
      hi: ['फसल अवशेष नष्ट करें', 'लाइट ट्रैप लगाएं', 'जल्दी बुवाई करें'],
      hinglish: ['Purani fasal ke tukde jalaa dein', 'Light trap lagayein', 'Jaldi buwai karein']
    },
    urgency: 'immediate'
  },
  {
    condition: 'caterpillar_attack',
    treatment: {
      en: ['Hand pick and destroy caterpillars', 'Spray Bt (Bacillus thuringiensis)', 'Apply Neem-based insecticide'],
      hi: ['हाथ से कैटरपिलर उठाकर नष्ट करें', 'Bt का छिड़काव करें', 'नीम आधारित कीटनाशक'],
      hinglish: ['Haath se caterpillar uthayein aur maar dein', 'Bt spray karein', 'Neem insecticide bhi effective hai']
    },
    prevention: {
      en: ['Use pheromone traps', 'Encourage natural predators', 'Crop rotation'],
      hi: ['फेरोमोन ट्रैप लगाएं', 'प्राकृतिक शत्रुओं को बढ़ावा दें', 'फसल चक्र अपनाएं'],
      hinglish: ['Pheromone trap lagayein', 'Birds aur lizards ko aane dein', 'Crop rotation karein']
    },
    urgency: 'soon'
  },
  {
    condition: 'overwatering',
    treatment: {
      en: ['Stop irrigation for 3-5 days', 'Improve drainage', 'Apply gypsum for heavy soils'],
      hi: ['3-5 दिन सिंचाई बंद करें', 'जल निकास सुधारें', 'भारी मिट्टी में जिप्सम डालें'],
      hinglish: ['3-5 din sinchai band karein', 'Drainage improve karein', 'Heavy mitti mein gypsum daalein']
    },
    prevention: {
      en: ['Use soil moisture sensors', 'Follow irrigation schedule', 'Check soil before watering'],
      hi: ['मृदा नमी सेंसर लगाएं', 'सिंचाई अनुसूची का पालन करें', 'पानी देने से पहले मिट्टी जांचें'],
      hinglish: ['Soil moisture sensor lagayein', 'Schedule ke hisaab se sinchai karein', 'Paani dene se pehle mitti check karein']
    },
    urgency: 'soon'
  },
  {
    condition: 'heat_stress',
    treatment: {
      en: ['Irrigate in early morning or evening', 'Apply mulch to cool soil', 'Use shade nets if possible'],
      hi: ['सुबह जल्दी या शाम को सिंचाई करें', 'मिट्टी ठंडी रखने के लिए मल्च लगाएं', 'संभव हो तो शेड नेट लगाएं'],
      hinglish: ['Subah jaldi ya shaam ko sinchai karein', 'Mulch lagakar mitti thandi rakhein', 'Shade net laga sakte hain']
    },
    prevention: {
      en: ['Choose heat-tolerant varieties', 'Maintain adequate soil moisture', 'Avoid afternoon operations'],
      hi: ['गर्मी सहने वाली किस्में चुनें', 'पर्याप्त नमी बनाए रखें', 'दोपहर में काम से बचें'],
      hinglish: ['Heat tolerant variety lagayein', 'Soil moisture maintain karein', 'Dopahar mein kaam mat karein']
    },
    urgency: 'soon'
  }
];

// ============================================
// MAIN DIAGNOSIS ENGINE
// ============================================

export function diagnoseCropHealth(input: CropHealthInput): CropHealthOutput {
  if (input.symptoms.length === 0 || input.symptoms.includes('no_symptoms')) {
    return getHealthyResponse(input);
  }

  // Find matching symptoms and calculate probabilities
  const diagnoses: Map<string, number> = new Map();
  
  for (const symptom of input.symptoms) {
    const rule = SYMPTOM_DATABASE.find(r => r.symptom === symptom);
    if (!rule) continue;

    for (const cause of rule.possibleCauses) {
      let confidence = cause.confidence;
      
      // Adjust confidence based on environmental triggers
      if (cause.triggers) {
        if (cause.triggers.highMoisture && input.soilMoisture && input.soilMoisture > 70) {
          confidence += 15;
        }
        if (cause.triggers.lowMoisture && input.soilMoisture && input.soilMoisture < 30) {
          confidence += 15;
        }
        if (cause.triggers.highTemp && input.temperature && input.temperature > 38) {
          confidence += 10;
        }
        if (cause.triggers.recentRain && input.recentRain) {
          confidence += 10;
        }
      }

      const existing = diagnoses.get(cause.condition) || 0;
      diagnoses.set(cause.condition, Math.min(100, existing + confidence));
    }
  }

  // Find top diagnosis
  let topCondition = '';
  let topConfidence = 0;
  
  diagnoses.forEach((confidence, condition) => {
    if (confidence > topConfidence) {
      topConfidence = confidence;
      topCondition = condition;
    }
  });

  // Get treatment info
  const treatment = TREATMENT_DATABASE.find(t => t.condition === topCondition);
  
  // Determine overall health
  let overallHealth: CropHealthOutput['overallHealth'] = 'moderate';
  if (input.symptoms.length >= 3 || topConfidence > 80) {
    overallHealth = topConfidence > 85 ? 'critical' : 'poor';
  } else if (input.symptoms.length === 1 && topConfidence < 60) {
    overallHealth = 'moderate';
  }

  return {
    overallHealth,
    diagnosis: {
      condition: topCondition,
      confidence: Math.round(topConfidence)
    },
    causes: treatment?.treatment || {
      en: ['Condition identified but treatment database incomplete'],
      hi: ['स्थिति पहचानी गई लेकिन उपचार जानकारी अपूर्ण'],
      hinglish: ['Condition identify ho gayi par treatment info incomplete hai']
    },
    treatment: treatment?.treatment || {
      en: ['Consult local agriculture officer'],
      hi: ['स्थानीय कृषि अधिकारी से संपर्क करें'],
      hinglish: ['Local agriculture officer se contact karein']
    },
    prevention: treatment?.prevention || {
      en: ['Practice crop rotation', 'Use quality seeds'],
      hi: ['फसल चक्र अपनाएं', 'गुणवत्ता वाले बीज उपयोग करें'],
      hinglish: ['Crop rotation karein', 'Quality seeds use karein']
    },
    urgency: treatment?.urgency || 'monitor'
  };
}

function getHealthyResponse(input: CropHealthInput): CropHealthOutput {
  const crop = CROP_DATABASE[input.cropType];
  return {
    overallHealth: 'healthy',
    diagnosis: {
      condition: 'healthy',
      confidence: 95
    },
    causes: {
      en: ['No disease symptoms detected'],
      hi: ['कोई रोग के लक्षण नहीं दिखे'],
      hinglish: ['Koi bimari ke lakshan nahi dikhe']
    },
    treatment: {
      en: ['Continue regular monitoring'],
      hi: ['नियमित निरीक्षण जारी रखें'],
      hinglish: ['Regular monitoring karte rahein']
    },
    prevention: {
      en: ['Maintain good cultural practices', 'Monitor weekly for early detection'],
      hi: ['अच्छी खेती पद्धतियां अपनाएं', 'जल्दी पता लगाने के लिए साप्ताहिक निरीक्षण'],
      hinglish: ['Achhi farming practices follow karein', 'Weekly check karte rahein']
    },
    urgency: 'none'
  };
}

// ============================================
// QUICK HEALTH CHECK (For Voice)
// ============================================

export function getQuickHealthAdvice(
  cropType: CropType,
  symptomDescription: string
): string {
  // Map description to symptoms
  const symptomMap: Record<string, SymptomType> = {
    'पीली पत्तियां': 'yellow_leaves',
    'yellow': 'yellow_leaves',
    'peeli': 'yellow_leaves',
    'भूरे धब्बे': 'brown_spots',
    'brown spots': 'brown_spots',
    'murjhana': 'wilting',
    'मुरझाना': 'wilting',
    'wilting': 'wilting',
    'safed powder': 'white_powder',
    'white powder': 'white_powder',
    'छेद': 'holes_in_leaves',
    'holes': 'holes_in_leaves',
    'chhed': 'holes_in_leaves',
    'aphid': 'aphids',
    'maahu': 'aphids',
    'chepa': 'aphids'
  };

  const detectedSymptoms: SymptomType[] = [];
  const lowerDesc = symptomDescription.toLowerCase();
  
  for (const [key, symptom] of Object.entries(symptomMap)) {
    if (lowerDesc.includes(key)) {
      detectedSymptoms.push(symptom);
    }
  }

  if (detectedSymptoms.length === 0) {
    return '✅ Koi specific bimari nahi samajh aayi. Agar aapko lagta hai fasal mein problem hai, toh local agriculture officer se milein.';
  }

  const result = diagnoseCropHealth({
    cropType,
    daysAfterSowing: 45,
    symptoms: detectedSymptoms
  });

  let response = '';
  
  if (result.overallHealth === 'critical') {
    response = '🚨 URGENT: ';
  } else if (result.overallHealth === 'poor') {
    response = '⚠️ WARNING: ';
  } else {
    response = '💡 ADVICE: ';
  }

  response += `${result.diagnosis.condition.replace(/_/g, ' ')} ho sakta hai (${result.diagnosis.confidence}% confidence).\n\n`;
  response += '🩺 Treatment:\n';
  response += result.treatment.hinglish.map(t => `• ${t}`).join('\n');

  return response;
}

// ============================================
// AVAILABLE SYMPTOMS LIST (For UI)
// ============================================

export function getAvailableSymptoms(): { id: SymptomType; en: string; hi: string }[] {
  return SYMPTOM_DATABASE.map(s => ({
    id: s.symptom,
    en: s.description.en,
    hi: s.description.hi
  }));
}
