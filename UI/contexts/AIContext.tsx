import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Screen } from '../types';
import { AgriGuardAI, detectIntent } from '../ai_engine';

interface AIState {
  isListening: boolean;
  lastCommand: string;
  lastResponse: string;
  pendingNavigation: Screen | null;
}

interface AIContextType extends AIState {
  startListening: () => void;
  stopListening: () => void;
  processCommand: (command: string) => { response: string; navigate?: Screen };
  clearPendingNavigation: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

// AI command processor using NEW AI Engine
const processVoiceCommand = (command: string): { response: string; navigate?: Screen } => {
  console.log('[AIContext] Processing command:', command);
  
  // Use AI Engine for intent detection
  const intentResult = detectIntent(command);
  console.log('[AIContext] Intent detected:', intentResult);
  
  // Get response from AI Engine
  const aiResponse = AgriGuardAI.chat(command);
  
  // Determine navigation based on intent
  let navigate: Screen | undefined;
  
  switch (intentResult.intent) {
    case 'ASK_IRRIGATION':
    case 'ASK_WATER_AMOUNT':
    case 'ASK_SOIL_MOISTURE':
      navigate = Screen.IRRIGATION;
      break;
    case 'ASK_ALERTS':
      navigate = Screen.ALERTS;
      break;
    case 'ASK_FERTILIZER':
    case 'ASK_CROP_HEALTH':
      // Stay on current screen, just show response
      break;
    default:
      // No navigation for other intents
      break;
  }
  
  return { response: aiResponse, navigate };
};

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AIState>({
    isListening: false,
    lastCommand: '',
    lastResponse: '',
    pendingNavigation: null,
  });

  const startListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: true }));
    
    // Try to use Web Speech API if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('[AIContext] Using Web Speech API');
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi for Indian farmers
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('[AIContext] Voice recognized:', transcript);
        const result = processVoiceCommand(transcript);
        
        setState(prev => ({
          ...prev,
          isListening: false,
          lastCommand: transcript,
          lastResponse: result.response,
          pendingNavigation: result.navigate || null,
        }));
        
        // Speak the response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result.response);
          utterance.lang = 'hi-IN';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.log('[AIContext] Speech recognition error:', event.error);
        // Fallback to demo mode
        fallbackToDemo();
      };
      
      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };
      
      recognition.start();
    } else {
      console.log('[AIContext] Web Speech API not available, using demo mode');
      fallbackToDemo();
    }
    
    // Fallback function for demo
    function fallbackToDemo() {
      setTimeout(() => {
        const mockCommands = [
          'Aaj paani dena hai kya?',
          'Temperature kya hai?',
          'Soil moisture check karo',
          'Fertilizer advice do',
        ];
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        const result = processVoiceCommand(randomCommand);
        
        setState(prev => ({
          ...prev,
          isListening: false,
          lastCommand: randomCommand,
          lastResponse: result.response,
          pendingNavigation: result.navigate || null,
        }));
        
        // Speak the response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result.response);
          utterance.lang = 'hi-IN';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }, 2000);
    }
  }, []);

  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const processCommand = useCallback((command: string) => {
    const result = processVoiceCommand(command);
    setState(prev => ({
      ...prev,
      lastCommand: command,
      lastResponse: result.response,
      pendingNavigation: result.navigate || null,
    }));
    return result;
  }, []);

  const clearPendingNavigation = useCallback(() => {
    setState(prev => ({ ...prev, pendingNavigation: null }));
  }, []);

  return (
    <AIContext.Provider value={{
      ...state,
      startListening,
      stopListening,
      processCommand,
      clearPendingNavigation,
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};
