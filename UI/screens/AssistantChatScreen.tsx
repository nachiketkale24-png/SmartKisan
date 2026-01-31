// AgriGuard Assistant Chat Screen
// Voice-first chat interface with continuous conversation

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { voiceService, VoiceStatus } from '../services/voiceService';
import { apiService, ChatMessage } from '../services/apiService';
import { AgriGuardAI, detectIntent } from '../ai_engine';
import { useOffline } from '../contexts/OfflineContext';
import ChatBubble from '../components/ChatBubble';
import MicButton from '../components/MicButton';

interface Props {
    onBack: () => void;
}

const AssistantChatScreen: React.FC<Props> = ({ onBack }) => {
    const { isOnline, isOfflineSimulation } = useOffline();
    const isOfflineMode = isOfflineSimulation || !isOnline;

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'ai',
            text: 'Namaste! 🙏 Main Kisan Sahayak hoon. Aap mujhse irrigation, fertilizer, mausam ya fasal ke baare mein pooch sakte hain. Mic button dabayein aur bolein!',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            type: 'general',
        },
    ]);

    // Voice state
    const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Text input state (fallback)
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInput, setTextInput] = useState('');

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // Configure voice service
    useEffect(() => {
        voiceService.configure({
            language: 'hi-IN',
            continuous: false,
            interimResults: true,
            onResult: (result) => {
                if (result.isFinal) {
                    setInterimTranscript('');
                    handleUserMessage(result.transcript);
                } else {
                    setInterimTranscript(result.transcript);
                }
            },
            onStatusChange: (status) => {
                setVoiceStatus(status);
                console.log('[AssistantChat] Voice status:', status);
            },
            onError: (error) => {
                console.error('[AssistantChat] Voice error:', error);
                addAIMessage(error, 'alert');
            },
        });
    }, []);

    // Add user message and get AI response
    const handleUserMessage = async (text: string) => {
        if (!text.trim()) return;

        const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        // Add user message immediately
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: text.trim(),
            timestamp,
        };
        setMessages(prev => [...prev, userMessage]);
        setVoiceStatus('processing');

        // Detect intent for message type
        const intentResult = detectIntent(text);
        console.log('[AssistantChat] Intent:', intentResult);

        // Show typing indicator
        setIsTyping(true);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Get AI response
            const response = await apiService.sendChatMessage(text);
            
            setVoiceStatus('responding');
            
            // Determine message type from intent
            let messageType: ChatMessage['type'] = 'general';
            switch (intentResult.intent) {
                case 'ASK_IRRIGATION':
                case 'ASK_WATER_AMOUNT':
                    messageType = 'irrigation';
                    break;
                case 'ASK_FERTILIZER':
                    messageType = 'fertilizer';
                    break;
                case 'ASK_WEATHER':
                    messageType = 'weather';
                    break;
                case 'ASK_CROP_HEALTH':
                    messageType = 'health';
                    break;
                case 'ASK_ALERTS':
                    messageType = 'alert';
                    break;
            }

            // Add AI response
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: response.message,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                type: messageType,
                data: response.data,
            };

            setIsTyping(false);
            setMessages(prev => [...prev, aiMessage]);

            // Speak the response
            await voiceService.speak(response.message, 'hi-IN');
            
            setVoiceStatus('idle');

        } catch (error) {
            console.error('[AssistantChat] Error:', error);
            setIsTyping(false);
            addAIMessage('Maaf kijiye, kuch galat ho gaya. Phir se try karein.', 'alert');
            setVoiceStatus('idle');
        }
    };

    // Add AI message helper
    const addAIMessage = (text: string, type: ChatMessage['type'] = 'general') => {
        const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'ai',
            text,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            type,
        };
        setMessages(prev => [...prev, aiMessage]);
    };

    // Handle mic button press
    const handleMicPress = () => {
        if (voiceStatus === 'listening') {
            voiceService.stopListening();
            setVoiceStatus('idle');
            setInterimTranscript('');
        } else if (voiceStatus === 'idle' || voiceStatus === 'error') {
            const started = voiceService.startListening();
            if (!started) {
                // Fallback to text input
                setShowTextInput(true);
                addAIMessage('Voice input available nahi hai. Text mein type karein.', 'alert');
            }
        }
    };

    // Handle text input submit
    const handleTextSubmit = () => {
        if (textInput.trim()) {
            handleUserMessage(textInput);
            setTextInput('');
        }
    };

    // Get status text
    const getStatusText = () => {
        switch (voiceStatus) {
            case 'listening': return '🎤 Listening... Boliye';
            case 'processing': return '⏳ Processing...';
            case 'responding': return '🔊 Responding...';
            case 'error': return '❌ Error - Try again';
            default: return '';
        }
    };

    // Quick prompts
    const quickPrompts = [
        { icon: '💧', text: 'Aaj paani dena hai?' },
        { icon: '🌡️', text: 'Temperature kya hai?' },
        { icon: '🧪', text: 'Fertilizer advice' },
        { icon: '🌾', text: 'Fasal kaisi hai?' },
    ];

    return (
        <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="flex items-center px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm safe-area-top">
                <button 
                    onClick={onBack} 
                    className="size-10 sm:size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
                </button>
                
                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold">Kisan Sahayak</h1>
                    </div>
                    
                    {/* Connection Status */}
                    <div className={`
                        flex items-center justify-center gap-1 text-[10px] sm:text-xs mt-1
                        ${isOfflineMode ? 'text-amber-600' : 'text-green-600'}
                    `}>
                        <span className="material-symbols-outlined text-[12px] sm:text-[14px]">
                            {isOfflineMode ? 'cloud_off' : 'cloud_done'}
                        </span>
                        <span>
                            {isOfflineMode ? 'Offline Mode Active' : 'Connected to Backend'}
                        </span>
                    </div>
                </div>

                {/* Toggle text input */}
                <button 
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="size-10 sm:size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                >
                    <span className="material-symbols-outlined text-xl">
                        {showTextInput ? 'mic' : 'keyboard'}
                    </span>
                </button>
            </header>

            {/* Status Banner */}
            {voiceStatus !== 'idle' && (
                <div className={`
                    px-4 py-2 text-center text-sm font-semibold
                    ${voiceStatus === 'listening' ? 'bg-red-500 text-white animate-pulse' :
                      voiceStatus === 'processing' ? 'bg-amber-500 text-black' :
                      voiceStatus === 'responding' ? 'bg-blue-500 text-white' :
                      'bg-red-600 text-white'}
                `}>
                    {getStatusText()}
                </div>
            )}

            {/* Interim Transcript */}
            {interimTranscript && (
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm italic text-gray-600 dark:text-gray-300">
                    "{interimTranscript}..."
                </div>
            )}

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 pb-48 scroll-smooth">
                {messages.map((msg) => (
                    <ChatBubble
                        key={msg.id}
                        role={msg.role}
                        text={msg.text}
                        timestamp={msg.timestamp}
                        type={msg.type}
                        data={msg.data}
                        showSpeak={msg.role === 'ai'}
                    />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <ChatBubble
                        role="ai"
                        text=""
                        isTyping={true}
                    />
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Quick Prompts */}
            <div className="px-3 sm:px-4 pb-2 bg-background-light dark:bg-background-dark">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt.text}
                            onClick={() => handleUserMessage(prompt.text)}
                            disabled={voiceStatus !== 'idle'}
                            className="shrink-0 px-3 sm:px-4 py-2 bg-white dark:bg-surface-dark rounded-full text-xs sm:text-sm font-medium shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 flex items-center gap-1.5 touch-manipulation disabled:opacity-50"
                        >
                            <span>{prompt.icon}</span>
                            {prompt.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-3 sm:p-4 pb-6 safe-area-bottom">
                {showTextInput ? (
                    /* Text Input Mode */
                    <div className="flex gap-2 sm:gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                            placeholder="Type your question..."
                            className="flex-1 h-12 sm:h-14 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 border-none outline-none text-base"
                            disabled={voiceStatus !== 'idle'}
                        />
                        <button
                            onClick={handleTextSubmit}
                            disabled={!textInput.trim() || voiceStatus !== 'idle'}
                            className="size-12 sm:size-14 bg-primary rounded-xl flex items-center justify-center text-black active:scale-90 disabled:opacity-50 transition-all touch-manipulation"
                        >
                            <span className="material-symbols-outlined text-2xl">send</span>
                        </button>
                    </div>
                ) : (
                    /* Voice Input Mode */
                    <div className="flex flex-col items-center">
                        <MicButton
                            size="large"
                            isListening={voiceStatus === 'listening'}
                            disabled={voiceStatus === 'processing' || voiceStatus === 'responding'}
                            onPress={handleMicPress}
                            showLabel={true}
                            label={voiceStatus === 'listening' ? 'Listening... Tap to stop' : 'Tap to speak'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssistantChatScreen;
