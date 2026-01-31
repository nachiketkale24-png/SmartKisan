import { SensorData, IrrigationRecommendation, ManualSensorInput } from '../types';
import { mockCrops, mockIrrigationRecommendations } from '../data/mockData';

const API_BASE_URL = 'http://localhost:3000/api'; // Change to your backend URL

class ApiService {
  // Fetch sensor data from backend
  async fetchSensorData(cropId: string): Promise<SensorData | null> {
    try {
      // Try to fetch from backend
      const response = await fetch(`${API_BASE_URL}/sensors/${cropId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend unavailable, using mock data');
    }

    // Fallback to mock data
    const crop = mockCrops.find(c => c.id === cropId);
    return crop?.sensorData || null;
  }

  // Get irrigation recommendation from backend or calculate locally
  async getIrrigationRecommendation(
    cropId: string,
    manualInput?: ManualSensorInput
  ): Promise<IrrigationRecommendation | null> {
    try {
      const endpoint = manualInput
        ? `${API_BASE_URL}/irrigation/calculate`
        : `${API_BASE_URL}/irrigation/recommendation/${cropId}`;

      const response = await fetch(endpoint, {
        method: manualInput ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: manualInput ? JSON.stringify({ cropId, ...manualInput }) : undefined,
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend unavailable, using mock/calculated data');
    }

    // Fallback: Use mock data or calculate locally
    if (manualInput) {
      return this.calculateIrrigationLocally(cropId, manualInput);
    }

    return mockIrrigationRecommendations.find(rec => rec.cropId === cropId) || null;
  }

  // Local irrigation calculation when backend is unavailable
  private calculateIrrigationLocally(
    cropId: string,
    input: ManualSensorInput
  ): IrrigationRecommendation {
    const crop = mockCrops.find(c => c.id === cropId);
    const cropName = crop?.name || 'Crop';
    const cropNameHindi = crop?.nameHindi || 'फसल';

    // Simple irrigation calculation logic
    let waterAmount = 2000; // Base water in liters
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    let reasons: string[] = [];
    let reasonsHindi: string[] = [];

    // Temperature factor
    if (input.temperature > 35) {
      waterAmount += 1500;
      priority = 'High';
      reasons.push('Temperature very high');
      reasonsHindi.push('तापमान बहुत अधिक है');
    } else if (input.temperature > 30) {
      waterAmount += 1000;
      reasons.push('Temperature is high');
      reasonsHindi.push('तापमान अधिक है');
    }

    // Soil moisture factor
    if (input.soilMoisture < 30) {
      waterAmount += 2000;
      priority = 'High';
      reasons.push('Soil moisture critically low');
      reasonsHindi.push('मिट्टी की नमी बहुत कम है');
    } else if (input.soilMoisture < 45) {
      waterAmount += 1000;
      reasons.push('Soil moisture is low');
      reasonsHindi.push('मिट्टी की नमी कम है');
    }

    // Soil type factor
    if (input.soilType === 'Sandy') {
      waterAmount += 500;
      reasons.push('Sandy soil needs more water');
      reasonsHindi.push('रेतीली मिट्टी में अधिक पानी चाहिए');
    } else if (input.soilType === 'Clay') {
      waterAmount -= 300;
      reasons.push('Clay soil retains water');
      reasonsHindi.push('चिकनी मिट्टी पानी रोकती है');
    }

    // Growth stage factor
    if (input.cropStage === 'Flowering' || input.cropStage === 'Fruiting') {
      waterAmount += 1000;
      if (priority !== 'High') priority = 'Medium';
      reasons.push(`${input.cropStage} stage needs more water`);
      reasonsHindi.push(`${input.cropStage} अवस्था में अधिक पानी चाहिए`);
    }

    const waterSaving = Math.floor(Math.random() * 15) + 10;

    return {
      id: `calc-${Date.now()}`,
      cropId,
      cropName,
      cropNameHindi,
      recommendedWater: waterAmount,
      reason: reasons.join('. ') || 'Standard irrigation recommended',
      reasonHindi: reasonsHindi.join('। ') || 'सामान्य सिंचाई की सलाह है',
      priority,
      waterSaving,
    };
  }

  // Sync offline data with backend
  async syncOfflineData(data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.log('Sync failed, will retry later');
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
