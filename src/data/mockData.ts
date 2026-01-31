import { Crop, DiseaseRecord, IrrigationRecommendation, FarmTask, SensorData } from '../types';

// Mock Crops Data
export const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Wheat',
    nameHindi: 'गेहूं',
    area: 2.5,
    areaUnit: 'acre',
    plantationDate: '2025-11-15',
    growthStage: 'Vegetative',
    healthStatus: 'Good',
    lastIrrigationDate: '2026-01-28',
    totalWaterGiven: 12500,
    fertilizerType: 'Mixed',
    fertilizerDates: ['2025-11-20', '2025-12-15', '2026-01-10'],
    diseaseHistory: [],
    sensorData: {
      temperature: 28,
      soilMoisture: 45,
      humidity: 60,
      soilPH: 6.8,
      lastUpdated: '2026-02-01T10:30:00',
    },
  },
  {
    id: '2',
    name: 'Rice',
    nameHindi: 'चावल',
    area: 3,
    areaUnit: 'acre',
    plantationDate: '2025-10-01',
    growthStage: 'Flowering',
    healthStatus: 'Warning',
    lastIrrigationDate: '2026-01-25',
    totalWaterGiven: 25000,
    fertilizerType: 'Organic',
    fertilizerDates: ['2025-10-10', '2025-11-05', '2025-12-01'],
    diseaseHistory: [
      {
        id: 'd1',
        diseaseName: 'Brown Spot',
        diseaseNameHindi: 'भूरा धब्बा',
        cropName: 'Rice',
        detectedDate: '2026-01-15',
        status: 'Under Treatment',
        severity: 'Medium',
        treatment: 'Apply fungicide spray every 7 days',
        treatmentHindi: 'हर 7 दिन में कवकनाशी स्प्रे करें',
      },
    ],
    sensorData: {
      temperature: 30,
      soilMoisture: 35,
      humidity: 55,
      soilPH: 6.5,
      lastUpdated: '2026-02-01T10:30:00',
    },
  },
  {
    id: '3',
    name: 'Cotton',
    nameHindi: 'कपास',
    area: 4,
    areaUnit: 'acre',
    plantationDate: '2025-06-15',
    growthStage: 'Harvest',
    healthStatus: 'Critical',
    lastIrrigationDate: '2026-01-20',
    totalWaterGiven: 35000,
    fertilizerType: 'Chemical',
    fertilizerDates: ['2025-07-01', '2025-08-15', '2025-10-01'],
    diseaseHistory: [
      {
        id: 'd2',
        diseaseName: 'Bollworm Infestation',
        diseaseNameHindi: 'बॉलवर्म का प्रकोप',
        cropName: 'Cotton',
        detectedDate: '2026-01-10',
        status: 'Active',
        severity: 'High',
        treatment: 'Apply neem-based pesticide immediately',
        treatmentHindi: 'तुरंत नीम आधारित कीटनाशक लगाएं',
      },
    ],
  },
  {
    id: '4',
    name: 'Sugarcane',
    nameHindi: 'गन्ना',
    area: 5,
    areaUnit: 'acre',
    plantationDate: '2025-02-01',
    growthStage: 'Fruiting',
    healthStatus: 'Good',
    lastIrrigationDate: '2026-01-30',
    totalWaterGiven: 75000,
    fertilizerType: 'Mixed',
    fertilizerDates: ['2025-03-01', '2025-05-15', '2025-08-01', '2025-11-01'],
    diseaseHistory: [
      {
        id: 'd3',
        diseaseName: 'Red Rot',
        diseaseNameHindi: 'लाल सड़न',
        cropName: 'Sugarcane',
        detectedDate: '2025-09-20',
        status: 'Recovered',
        severity: 'Low',
        treatment: 'Removed infected plants, applied copper fungicide',
        treatmentHindi: 'संक्रमित पौधे हटाए, तांबा कवकनाशी लगाया',
      },
    ],
    sensorData: {
      temperature: 32,
      soilMoisture: 55,
      humidity: 65,
      soilPH: 7.0,
      lastUpdated: '2026-02-01T10:30:00',
    },
  },
];

// Mock Disease Records
export const mockDiseases: DiseaseRecord[] = [
  {
    id: 'd1',
    diseaseName: 'Brown Spot',
    diseaseNameHindi: 'भूरा धब्बा',
    cropName: 'Rice',
    detectedDate: '2026-01-15',
    status: 'Under Treatment',
    severity: 'Medium',
    treatment: 'Apply fungicide spray every 7 days. Keep field drainage good.',
    treatmentHindi: 'हर 7 दिन में कवकनाशी स्प्रे करें। खेत की जल निकासी अच्छी रखें।',
  },
  {
    id: 'd2',
    diseaseName: 'Bollworm Infestation',
    diseaseNameHindi: 'बॉलवर्म का प्रकोप',
    cropName: 'Cotton',
    detectedDate: '2026-01-10',
    status: 'Active',
    severity: 'High',
    treatment: 'Apply neem-based pesticide immediately. Check plants daily.',
    treatmentHindi: 'तुरंत नीम आधारित कीटनाशक लगाएं। रोज पौधों की जांच करें।',
  },
  {
    id: 'd3',
    diseaseName: 'Red Rot',
    diseaseNameHindi: 'लाल सड़न',
    cropName: 'Sugarcane',
    detectedDate: '2025-09-20',
    status: 'Recovered',
    severity: 'Low',
    treatment: 'Removed infected plants, applied copper fungicide',
    treatmentHindi: 'संक्रमित पौधे हटाए, तांबा कवकनाशी लगाया',
  },
];

// Mock Irrigation Recommendations
export const mockIrrigationRecommendations: IrrigationRecommendation[] = [
  {
    id: 'ir1',
    cropId: '2',
    cropName: 'Rice',
    cropNameHindi: 'चावल',
    recommendedWater: 5000,
    reason: 'Soil moisture is low (35%). Temperature is high (30°C). Flowering stage needs more water.',
    reasonHindi: 'मिट्टी की नमी कम है (35%)। तापमान अधिक है (30°C)। फूल आने की अवस्था में अधिक पानी चाहिए।',
    priority: 'High',
    waterSaving: 15,
  },
  {
    id: 'ir2',
    cropId: '3',
    cropName: 'Cotton',
    cropNameHindi: 'कपास',
    recommendedWater: 3000,
    reason: 'Last irrigation was 12 days ago. Harvest stage needs moderate water.',
    reasonHindi: 'पिछली सिंचाई 12 दिन पहले हुई थी। कटाई की अवस्था में मध्यम पानी चाहिए।',
    priority: 'Medium',
    waterSaving: 20,
  },
  {
    id: 'ir3',
    cropId: '1',
    cropName: 'Wheat',
    cropNameHindi: 'गेहूं',
    recommendedWater: 2000,
    reason: 'Soil moisture adequate but temperature rising. Preventive irrigation recommended.',
    reasonHindi: 'मिट्टी की नमी पर्याप्त है लेकिन तापमान बढ़ रहा है। निवारक सिंचाई की सलाह है।',
    priority: 'Low',
    waterSaving: 25,
  },
];

// Mock Today's Tasks
export const mockTasks: FarmTask[] = [
  {
    id: 't1',
    title: 'Irrigate Rice Field',
    titleHindi: 'चावल के खेत में सिंचाई करें',
    type: 'irrigation',
    cropName: 'Rice',
    priority: 'High',
    completed: false,
    dueTime: '6:00 AM',
  },
  {
    id: 't2',
    title: 'Apply fertilizer to Wheat',
    titleHindi: 'गेहूं में खाद डालें',
    type: 'fertilizer',
    cropName: 'Wheat',
    priority: 'Medium',
    completed: false,
    dueTime: '8:00 AM',
  },
  {
    id: 't3',
    title: 'Check Cotton for pests',
    titleHindi: 'कपास में कीटों की जांच करें',
    type: 'disease',
    cropName: 'Cotton',
    priority: 'High',
    completed: false,
    dueTime: '10:00 AM',
  },
  {
    id: 't4',
    title: 'Harvest Sugarcane - Section A',
    titleHindi: 'गन्ने की कटाई करें - सेक्शन A',
    type: 'harvest',
    cropName: 'Sugarcane',
    priority: 'Medium',
    completed: true,
  },
  {
    id: 't5',
    title: 'Spray fungicide on Rice',
    titleHindi: 'चावल पर कवकनाशी स्प्रे करें',
    type: 'disease',
    cropName: 'Rice',
    priority: 'High',
    completed: false,
    dueTime: '4:00 PM',
  },
];

// Helper functions
export const getCropById = (id: string): Crop | undefined => {
  return mockCrops.find(crop => crop.id === id);
};

export const getDiseaseById = (id: string): DiseaseRecord | undefined => {
  return mockDiseases.find(disease => disease.id === id);
};

export const getPriorityIrrigation = (): IrrigationRecommendation | undefined => {
  return mockIrrigationRecommendations.find(rec => rec.priority === 'High');
};

export const getTodaysTasks = (): FarmTask[] => {
  return mockTasks;
};

export const getPendingTasks = (): FarmTask[] => {
  return mockTasks.filter(task => !task.completed);
};
