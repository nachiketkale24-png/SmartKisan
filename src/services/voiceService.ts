import * as Speech from 'expo-speech';

class VoiceService {
  private isSpeaking: boolean = false;
  private currentLanguage: 'en' | 'hi' = 'hi';

  setLanguage(lang: 'en' | 'hi') {
    this.currentLanguage = lang;
  }

  async speak(text: string, language?: 'en' | 'hi'): Promise<void> {
    const lang = language || this.currentLanguage;
    
    // Stop any ongoing speech
    if (this.isSpeaking) {
      await this.stop();
    }

    return new Promise((resolve, reject) => {
      this.isSpeaking = true;
      
      Speech.speak(text, {
        language: lang === 'hi' ? 'hi-IN' : 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: (error) => {
          this.isSpeaking = false;
          reject(error);
        },
        onStopped: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Speak crop summary
  async speakCropSummary(
    cropName: string,
    healthStatus: string,
    lastIrrigation: string,
    recommendation: string,
    useHindi: boolean = true
  ): Promise<void> {
    let text: string;
    
    if (useHindi) {
      text = `${cropName} की स्थिति ${healthStatus} है। 
        पिछली सिंचाई ${lastIrrigation} को हुई थी। 
        सलाह: ${recommendation}`;
    } else {
      text = `${cropName} health status is ${healthStatus}. 
        Last irrigation was on ${lastIrrigation}. 
        Recommendation: ${recommendation}`;
    }

    await this.speak(text, useHindi ? 'hi' : 'en');
  }

  // Speak irrigation recommendation
  async speakIrrigationRecommendation(
    cropName: string,
    waterAmount: number,
    reason: string,
    waterSaving: number,
    useHindi: boolean = true
  ): Promise<void> {
    let text: string;
    
    if (useHindi) {
      text = `${cropName} के लिए सिंचाई की सलाह। 
        ${waterAmount} लीटर पानी दें। 
        कारण: ${reason}। 
        इससे ${waterSaving} प्रतिशत पानी की बचत होगी।`;
    } else {
      text = `Irrigation recommendation for ${cropName}. 
        Give ${waterAmount} liters of water. 
        Reason: ${reason}. 
        This will save ${waterSaving} percent water.`;
    }

    await this.speak(text, useHindi ? 'hi' : 'en');
  }

  // Speak disease information
  async speakDiseaseInfo(
    diseaseName: string,
    cropName: string,
    status: string,
    treatment: string,
    useHindi: boolean = true
  ): Promise<void> {
    let text: string;
    
    if (useHindi) {
      text = `${cropName} में ${diseaseName} का पता चला है। 
        वर्तमान स्थिति: ${status}। 
        उपचार: ${treatment}`;
    } else {
      text = `${diseaseName} detected in ${cropName}. 
        Current status: ${status}. 
        Treatment: ${treatment}`;
    }

    await this.speak(text, useHindi ? 'hi' : 'en');
  }
}

export const voiceService = new VoiceService();
export default voiceService;
