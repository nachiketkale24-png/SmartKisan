
export enum Screen {
  SPLASH = 'SPLASH',
  LANGUAGE = 'LANGUAGE',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  CHAT = 'CHAT',
  IRRIGATION = 'IRRIGATION',
  CLAIM = 'CLAIM',
  SYNC = 'SYNC',
  ALERTS = 'ALERTS',
  OFFLINE_INPUT = 'OFFLINE_INPUT',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT'
}

// Demo mock data for presentation mode
export const DEMO_DATA = {
  soilMoisture: 72,
  irrigationStatus: 'over' as 'normal' | 'over' | 'under',
  waterSavedToday: 450,
  waterSavingGoal: 600,
  isOfflineMode: true,
  isLowPowerMode: false,
  pendingSyncs: 2,
  alerts: [
    {
      id: '1',
      type: 'over' as const,
      message: 'Over irrigation detected in Plot A',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      severity: 'high' as const
    },
    {
      id: '2',
      type: 'weather' as const,
      message: 'Rain expected - irrigation cancelled',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      severity: 'medium' as const
    },
    {
      id: '3',
      type: 'under' as const,
      message: 'Low moisture in Plot B - needs water',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      severity: 'low' as const
    }
  ],
  recommendation: {
    action: 'Stop irrigation today',
    reason: 'Soil moisture above optimal range (72% > 60%)'
  }
};

export interface Alert {
  id: string;
  type: 'over' | 'under' | 'weather';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  image?: string;
  timestamp: string;
}

export interface Diagnosis {
  disease: string;
  severity: number;
  stressLevel: 'Low' | 'Medium' | 'High';
  suggestions: string[];
}
