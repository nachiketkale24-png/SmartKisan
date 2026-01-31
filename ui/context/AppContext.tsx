
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Screen } from '../types';

// Import API Service (Frontend communicates ONLY through this service)
import { assistantAPI, AssistantResponse, SensorData, FarmContext } from '../services/assistantAPI';

// Type alias for backward compatibility
type VoiceResponse = {
  text: string;
  intent: string;
  confidence: number;
  action?: string;
  data?: any;
};

// ============================================
// OFFLINE CONTEXT - Connectivity State Management
// ============================================
interface OfflineContextType {
  isOffline: boolean;
  setIsOffline: (value: boolean) => void;
  lastSyncTime: Date | null;
  pendingSyncs: number;
  cachedWeatherActive: boolean;
  offlineDecisionEngineRunning: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
};

// ============================================
// AI ASSISTANT CONTEXT - Voice & AI State
// ============================================
interface AIContextType {
  isListening: boolean;
  setIsListening: (value: boolean) => void;
  transcript: string;
  setTranscript: (value: string) => void;
  aiResponse: string;
  setAiResponse: (value: string) => void;
  isSpeaking: boolean;
  processVoiceCommand: (command: string, navigate: (screen: Screen) => void) => Promise<void>;
  speakText: (text: string) => void;
  lastAIResult: VoiceResponse | null;
  askQuestion: (question: string) => Promise<VoiceResponse>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};

// ============================================
// IOT CONTEXT - Device Connectivity
// ============================================
interface IoTContextType {
  deviceStatus: 'searching' | 'connected' | 'disconnected';
  sensorData: SensorData | null;
  lastDataReceived: Date | null;
  farmContext: FarmContext;
  updateFarmContext: (context: Partial<FarmContext>) => Promise<void>;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (!context) throw new Error('useIoT must be used within IoTProvider');
  return context;
};

// ============================================
// SCREEN ROUTING FROM AI RESPONSE
// ============================================
const getScreenFromAction = (action?: string): Screen | null => {
  if (!action) return null;
  
  const actionMap: Record<string, Screen> = {
    'SHOW_IRRIGATION_ALERT': Screen.IRRIGATION,
    'SHOW_FERTILIZER_PANEL': Screen.DASHBOARD,
    'SHOW_HEALTH_DETAILS': Screen.DASHBOARD,
    'SHOW_SYMPTOM_SELECTOR': Screen.CHAT,
    'SHOW_SAVINGS_REPORT': Screen.SYNC,
    'SHOW_HELP_PANEL': Screen.VOICE_ASSISTANT,
  };
  
  return actionMap[action] || null;
};

// ============================================
// COMBINED APP PROVIDER
// ============================================
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Backend connectivity state
  const [backendConnected, setBackendConnected] = useState(false);

  // Check backend connectivity on mount
  useEffect(() => {
    const checkBackend = async () => {
      const isOnline = await assistantAPI.ping();
      setBackendConnected(isOnline);
      if (isOnline) {
        console.log('✅ Connected to AgriGuard Backend');
      } else {
        console.log('⚠️ Backend not available - running in offline mode');
      }
    };
    checkBackend();
    
    // Check periodically
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Offline State
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date(Date.now() - 1000 * 60 * 30));
  const [pendingSyncs, setPendingSyncs] = useState(2);
  const [cachedWeatherActive] = useState(true);
  const [offlineDecisionEngineRunning] = useState(true);

  // AI State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastAIResult, setLastAIResult] = useState<VoiceResponse | null>(null);

  // IoT State - Sensor data from backend API
  const [deviceStatus, setDeviceStatus] = useState<'searching' | 'connected' | 'disconnected'>('searching');
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [lastDataReceived, setLastDataReceived] = useState<Date | null>(null);
  const [farmContext, setFarmContextState] = useState<FarmContext>({
    cropType: 'wheat',
    daysAfterSowing: 45,
    soilType: 'loamy'
  });

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sensor data from backend
  useEffect(() => {
    const loadSensorData = async () => {
      const data = await assistantAPI.getSensorData();
      if (data) {
        setSensorData(data.sensors);
        setFarmContextState(data.farm);
        setLastDataReceived(new Date());
        setDeviceStatus('connected');
      } else {
        setDeviceStatus('disconnected');
      }
    };
    
    loadSensorData();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(loadSensorData, 10000);
    return () => clearInterval(interval);
  }, [backendConnected]);

  // Update farm context via API
  const updateFarmContext = useCallback(async (context: Partial<FarmContext>) => {
    const success = await assistantAPI.updateFarmContext(context);
    if (success) {
      setFarmContextState(prev => ({ ...prev, ...context }));
    }
  }, []);

  // Ask AI a question (via backend API)
  const askQuestion = useCallback(async (question: string): Promise<VoiceResponse> => {
    const result = await assistantAPI.sendQuery(question, {
      ...sensorData,
      ...farmContext
    });
    
    const voiceResponse: VoiceResponse = {
      text: result.reply,
      intent: result.intent,
      confidence: result.confidence,
      action: result.action,
      data: result.data
    };
    
    setLastAIResult(voiceResponse);
    setAiResponse(result.reply);
    return voiceResponse;
  }, [sensorData, farmContext]);

  // Process voice command (via backend API)
  const processVoiceCommand = useCallback(async (command: string, navigate: (screen: Screen) => void) => {
    const result = await assistantAPI.sendQuery(command, {
      ...sensorData,
      ...farmContext
    });
    
    const voiceResponse: VoiceResponse = {
      text: result.reply,
      intent: result.intent,
      confidence: result.confidence,
      action: result.action,
      data: result.data
    };
    
    setLastAIResult(voiceResponse);
    setAiResponse(result.reply);
    
    // Speak the response
    speakText(result.reply);
    
    // Navigate if needed based on AI action
    const targetScreen = getScreenFromAction(result.action);
    if (targetScreen) {
      setTimeout(() => navigate(targetScreen), 1500);
    }
  }, [sensorData, farmContext]);

  // Text-to-Speech
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback for browsers without TTS
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  }, []);

  const offlineValue: OfflineContextType = {
    isOffline,
    setIsOffline,
    lastSyncTime,
    pendingSyncs,
    cachedWeatherActive,
    offlineDecisionEngineRunning
  };

  const aiValue: AIContextType = {
    isListening,
    setIsListening,
    transcript,
    setTranscript,
    aiResponse,
    setAiResponse,
    isSpeaking,
    processVoiceCommand,
    speakText,
    lastAIResult,
    askQuestion
  };

  const iotValue: IoTContextType = {
    deviceStatus,
    sensorData,
    lastDataReceived,
    farmContext,
    updateFarmContext
  };

  return (
    <OfflineContext.Provider value={offlineValue}>
      <AIContext.Provider value={aiValue}>
        <IoTContext.Provider value={iotValue}>
          {children}
        </IoTContext.Provider>
      </AIContext.Provider>
    </OfflineContext.Provider>
  );
};

export default AppProvider;
