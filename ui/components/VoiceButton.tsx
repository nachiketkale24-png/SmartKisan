
import React, { useState, useEffect, useCallback } from 'react';
import { Screen } from '../types';
import { useAI, useOffline } from '../context/AppContext';

interface VoiceButtonProps {
  onNavigate: (screen: Screen) => void;
  className?: string;
}

// ============================================
// GLOBAL VOICE ASSISTANT BUTTON COMPONENT
// Persistent floating button visible on all screens
// ============================================
const VoiceButton: React.FC<VoiceButtonProps> = ({ onNavigate, className = '' }) => {
  const { isListening, setIsListening, transcript, setTranscript, aiResponse, processVoiceCommand, isSpeaking } = useAI();
  const { isOffline } = useOffline();
  const [showModal, setShowModal] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

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
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceCommand(transcript, onNavigate);
        }
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [transcript]);

  const startListening = useCallback(() => {
    setShowModal(true);
    setTranscript('');
    setIsListening(true);

    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        // Fallback for demo - simulate voice input
        setTimeout(() => {
          setTranscript('Should I irrigate today?');
          setTimeout(() => {
            setIsListening(false);
            processVoiceCommand('Should I irrigate today?', onNavigate);
          }, 1000);
        }, 2000);
      }
    } else {
      // Demo simulation without speech recognition API
      setTimeout(() => {
        setTranscript('Aaj irrigation karoon?');
        setTimeout(() => {
          setIsListening(false);
          processVoiceCommand('Aaj irrigation karoon?', onNavigate);
        }, 1000);
      }, 2000);
    }
  }, [recognition, onNavigate, processVoiceCommand]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  return (
    <>
      {/* Floating Voice Button */}
      <button
        onClick={startListening}
        className={`fixed z-50 flex items-center justify-center rounded-full shadow-2xl transition-all active:scale-95 ${
          isListening 
            ? 'bg-red-500 animate-pulse size-20' 
            : 'bg-gradient-to-br from-green-500 to-green-700 size-16'
        } ${className}`}
        style={{ bottom: '100px', right: '20px' }}
      >
        <span className="material-symbols-outlined text-white text-[32px]">
          {isListening ? 'graphic_eq' : 'mic'}
        </span>
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></span>
            <span className="absolute inset-[-8px] rounded-full border-2 border-red-400 animate-pulse opacity-50"></span>
          </>
        )}
      </button>

      {/* Voice Assistant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1a2e1a] rounded-t-3xl p-6 pb-10 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[28px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Kisan Sahayak</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {isOffline && <span className="material-symbols-outlined text-[12px]">cloud_off</span>}
                    {isOffline ? 'Offline Mode' : 'Online'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setShowModal(false); stopListening(); }}
                className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Listening Animation */}
            <div className="flex flex-col items-center py-8">
              <div className={`size-24 rounded-full flex items-center justify-center mb-4 transition-all ${
                isListening 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : isSpeaking 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <span className={`material-symbols-outlined text-[48px] ${
                  isListening 
                    ? 'text-red-500 animate-pulse' 
                    : isSpeaking 
                      ? 'text-blue-500' 
                      : 'text-green-500'
                }`}>
                  {isListening ? 'mic' : isSpeaking ? 'volume_up' : 'check_circle'}
                </span>
              </div>

              {/* Status Text */}
              <p className="text-lg font-bold mb-2">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
              </p>
              <p className="text-sm text-gray-500">
                {isListening 
                  ? 'Boliye - Main sun raha hoon' 
                  : isSpeaking 
                    ? 'Jawab de raha hoon...' 
                    : 'Mic button dabayein'}
              </p>

              {/* Transcript */}
              {transcript && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl w-full">
                  <p className="text-xs text-gray-500 mb-1">Aapne kaha:</p>
                  <p className="text-base font-medium">"{transcript}"</p>
                </div>
              )}

              {/* AI Response */}
              {aiResponse && !isListening && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl w-full border-l-4 border-green-500">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    AI Response:
                  </p>
                  <p className="text-base font-medium text-green-800 dark:text-green-200">{aiResponse}</p>
                </div>
              )}
            </div>

            {/* Voice Wave Animation */}
            {isListening && (
              <div className="flex items-center justify-center gap-1 h-12 mb-4">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-voice-wave"
                    style={{ 
                      height: `${Math.random() * 30 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Quick Command Suggestions */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Try saying:</p>
              <div className="flex flex-wrap gap-2">
                {['Aaj irrigation karoon?', 'Soil moisture check karo', 'Alerts dikhao'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => {
                      setTranscript(cmd);
                      processVoiceCommand(cmd, onNavigate);
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium active:scale-95"
                  >
                    🎤 {cmd}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-full mt-6 h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-green-700 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isListening ? 'stop' : 'mic'}
              </span>
              {isListening ? 'Stop' : 'Start Listening'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceButton;
