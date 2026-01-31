// Crop Types
export interface Crop {
  id: string;
  name: string;
  nameHindi: string;
  area: number;
  areaUnit: 'acre' | 'hectare';
  plantationDate: string;
  growthStage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';
  healthStatus: 'Good' | 'Warning' | 'Critical';
  lastIrrigationDate: string;
  totalWaterGiven: number; // in liters
  fertilizerType: 'Organic' | 'Chemical' | 'Mixed';
  fertilizerDates: string[];
  diseaseHistory: DiseaseRecord[];
  sensorData?: SensorData;
}

// Disease Types
export interface DiseaseRecord {
  id: string;
  diseaseName: string;
  diseaseNameHindi: string;
  cropName: string;
  detectedDate: string;
  status: 'Recovered' | 'Under Treatment' | 'Active';
  severity: 'Low' | 'Medium' | 'High';
  treatment: string;
  treatmentHindi: string;
}

// Sensor Data Types
export interface SensorData {
  temperature: number;
  soilMoisture: number;
  humidity: number;
  soilPH: number;
  lastUpdated: string;
}

// Irrigation Types
export interface IrrigationRecommendation {
  id: string;
  cropId: string;
  cropName: string;
  cropNameHindi: string;
  recommendedWater: number; // in liters
  reason: string;
  reasonHindi: string;
  priority: 'High' | 'Medium' | 'Low';
  waterSaving: number; // percentage
}

// Task Types
export interface FarmTask {
  id: string;
  title: string;
  titleHindi: string;
  type: 'irrigation' | 'fertilizer' | 'disease' | 'harvest' | 'general';
  cropName: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  dueTime?: string;
}

// Manual Input Types
export interface ManualSensorInput {
  temperature: number;
  soilMoisture: number;
  soilType: 'Clay' | 'Sandy' | 'Loamy' | 'Silty';
  cropStage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  CropDetails: { cropId: string };
  IrrigationRecommendation: { cropId?: string };
  DiseaseDetails: { diseaseId: string };
  HealthHome: undefined;
  CropHealthDetail: { cropId: string };
  DiseaseScan: {
    cropId: string;
    cropName: string;
    imageUri: string;
  };
  DiseaseResult: {
    diseaseName: string;
    diseaseNameHindi?: string;
    severity: 'Low' | 'Medium' | 'High';
    cause: string;
    causeHindi?: string;
    solution: string;
    solutionHindi?: string;
    prevention: string;
    preventionHindi?: string;
    imageUri?: string;
    cropName: string;
  };
  GovernmentSchemes: undefined;
  SchemeDetail: { schemeId: string };
  MarketPrices: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Irrigation: undefined;
  Health: undefined;
  Alerts: undefined;
  Assistant: undefined;
};
