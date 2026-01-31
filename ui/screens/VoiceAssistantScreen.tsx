
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Screen } from '../types';
import { useAI, useOffline, useIoT } from '../context/AppContext';
import SpeakButton from '../components/SpeakButton';
import { getQuickCommands, getSystemStatus } from '../ai_engine';

interface Props {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  intent?: string;
  confidence?: number;
}

const VoiceAssistantScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
  const { isListening, setIsListening, transcript, setTranscript, speakText, isSpeaking, askQuestion } = useAI();
  const { isOffline } = useOffline();
  const { sensorData, deviceStatus } = useIoT();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text: 'Namaste! 🙏 Main Kisan Sahayak hoon - aapka AI farming assistant. Voice ya text se baat karein.\n\n💡 Puchiye:\n• "Aaj paani dena hai kya?"\n• "Fertilizer advice do"\n• "Fasal ki health batao"\n• "Mausam kaisa hai?"',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Get system status
  const systemStatus = getSystemStatus();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'hi-IN';

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);
        setInput(transcriptResult);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startVoiceInput = useCallback(() => {
    setIsListening(true);
    setTranscript('');
    
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        // Demo fallback
        setTimeout(() => {
          const demoInputs = ['Aaj irrigation karoon?', 'Soil moisture check karo', 'Fertilizer advice do'];
          const randomInput = demoInputs[Math.floor(Math.random() * demoInputs.length)];
          setInput(randomInput);
          setTranscript(randomInput);
          setIsListening(false);
        }, 2000);
      }
    } else {
      // Demo simulation
      setTimeout(() => {
        const demoInputs = ['Aaj irrigation karoon?', 'Mausam kaisa hai?', 'Khad kab daaloon?'];
        const randomInput = demoInputs[Math.floor(Math.random() * demoInputs.length)];
        setInput(randomInput);
        setTranscript(randomInput);
        setIsListening(false);
      }, 2000);
    }
  }, [recognition]);

  const stopVoiceInput = useCallback(() => {
    setIsListening(false);
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: isListening
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get REAL AI response from engine
    const aiResult = askQuestion(userMessage.text);
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: aiResult.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: aiResult.intent,
      confidence: Math.round(aiResult.confidence * 100)
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);

    // Auto-speak response
    speakText(aiResult.text);
  };

  // Quick command chips from AI engine
  const quickCommands = getQuickCommands().slice(0, 4).map(cmd => ({
    text: cmd.hinglish,
    icon: cmd.icon === '💧' ? 'water_drop' : 
          cmd.icon === '🌱' ? 'compost' : 
          cmd.icon === '🩺' ? 'medical_services' : 
          cmd.icon === '🌤️' ? 'wb_sunny' : 'help'
  }));

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a2e1a] z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="size-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[24px]">smart_toy</span>
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">Kisan Sahayak</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="size-2 rounded-full bg-green-500"></span>
              AI Assistant
            </p>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 py-2 px-4 flex items-center justify-between border-b border-amber-100 dark:border-amber-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-[16px]">
            {systemStatus.sensorSource === 'live' ? 'sensors' : 'cloud_off'}
          </span>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            {systemStatus.sensorSource === 'live' ? 'Live Sensors' : 'Offline AI'} • {systemStatus.cropType}
          </p>
        </div>
        {sensorData && (
          <div className="flex items-center gap-3 text-xs text-amber-600 dark:text-amber-400">
            <span>💧 {sensorData.soilMoisture}%</span>
            <span>🌡️ {sensorData.temperature}°C</span>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="size-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
              </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-green-500 to-green-700 text-white rounded-tr-none'
                  : 'bg-white dark:bg-[#1a2e1a] rounded-tl-none border border-gray-100 dark:border-gray-800'
              }`}>
                <p className="text-base leading-relaxed">{msg.text}</p>
                {msg.isVoice && (
                  <span className="material-symbols-outlined text-[14px] opacity-70 mt-1">mic</span>
                )}
              </div>
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <SpeakButton text={msg.text} size="sm" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-end gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1a2e1a] rounded-tl-none border border-gray-100 dark:border-gray-800">
              <div className="flex gap-1">
                <div className="size-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="size-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="size-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Listening indicator */}
        {isListening && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <span className="material-symbols-outlined text-red-500 animate-pulse">mic</span>
              <span className="text-sm font-semibold text-red-600">Listening... Boliye!</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-voice-wave"
                    style={{ height: `${Math.random() * 16 + 8}px`, animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quick Commands */}
      <div className="px-4 py-2 bg-white dark:bg-[#1a2e1a] border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.text}
              onClick={() => { setInput(cmd.text); }}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full text-sm font-medium active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-green-600">{cmd.icon}</span>
              {cmd.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#1a2e1a] border-t border-gray-100 dark:border-gray-800 pb-8">
        <div className="flex items-end gap-3">
          {/* Voice Input Button */}
          <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={`size-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
              isListening
                ? 'bg-red-500 animate-pulse'
                : 'bg-gradient-to-br from-green-500 to-green-700'
            }`}
          >
            <span className="material-symbols-outlined text-white text-[28px]">
              {isListening ? 'stop' : 'mic'}
            </span>
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type ya voice use karein..."
              className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg focus:border-green-500 focus:outline-none transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className={`size-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
              input.trim() && !isProcessing
                ? 'bg-gradient-to-br from-green-500 to-green-700'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-white text-[28px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantScreen;
