
export enum Screen {
  SPLASH = 'SPLASH',
  LANGUAGE = 'LANGUAGE',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  CHAT = 'CHAT',
  IRRIGATION = 'IRRIGATION',
  CLAIM = 'CLAIM',
  SYNC = 'SYNC',
  AI = 'AI',
  AI_ASSISTANT = 'AI_ASSISTANT',
  ALERTS = 'ALERTS',
  FALLBACK = 'FALLBACK',
  ASSISTANT = 'ASSISTANT',  // Main assistant tab
  APP_SHELL = 'APP_SHELL',  // Main app shell after login
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
