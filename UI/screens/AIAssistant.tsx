import React, { useState, useRef, useEffect } from 'react';
import { AgriGuardAI } from '../ai_engine';
import { useOffline } from '../contexts/OfflineContext';
import VoiceButton from '../components/VoiceButton';
import SpeakButton from '../components/SpeakButton';

interface Props {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: string;
}

const AIAssistant: React.FC<Props> = ({ onBack }) => {
    const { isOfflineSimulation, isDemoMode } = useOffline();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            text: 'Namaste! Main aapka farming assistant hoon. Irrigation, fertilizer, ya weather ke baare mein poochein.',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isVoiceMode, setIsVoiceMode] = useState(true); // Default to voice for rural users
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Use NEW AI Engine for response
        setTimeout(() => {
            const response = AgriGuardAI.chat(text);
            console.log('[AIAssistant] AI Response:', response);
            
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: response,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 600);
    };

    const quickPrompts = [
        { icon: '💧', text: 'Aaj paani dena hai?' },
        { icon: '🌡️', text: 'Temperature kya hai?' },
        { icon: '🌱', text: 'Soil moisture check' },
        { icon: '🧪', text: 'Fertilizer advice' },
        { icon: '🌾', text: 'Fasal kaisi hai?' },
        { icon: '⚠️', text: 'Koi alert hai?' },
    ];

    return (
        <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
            {/* Header - Mobile Optimized */}
            <header className="flex items-center px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm safe-area-top">
                <button onClick={onBack} className="size-10 sm:size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
                </button>
                <div className="flex-1 text-center pr-10 sm:pr-12">
                    <h1 className="text-lg sm:text-xl font-bold">AI Assistant</h1>
                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-amber-600">
                        <span className="material-symbols-outlined text-[12px] sm:text-[14px]">cloud_off</span>
                        <span>Offline Mode{isDemoMode ? ' • Demo' : ''}</span>
                    </div>
                </div>
            </header>

            {/* Messages - Mobile Optimized */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-44 sm:pb-48 scroll-smooth">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${msg.role === 'user'
                                ? 'bg-primary text-black rounded-br-sm'
                                : 'bg-white dark:bg-surface-dark shadow-sm rounded-bl-sm'
                            }`}>
                            <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>
                            <div className="flex items-center justify-end gap-2 mt-1">
                                <span className="text-[10px] sm:text-xs opacity-60">{msg.timestamp}</span>
                                {msg.role === 'ai' && <SpeakButton text={msg.text} className="size-5 sm:size-6 text-[12px] sm:text-[14px]" />}
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-surface-dark rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Quick Prompts - Mobile Optimized with Icons */}
            <div className="px-3 sm:px-4 pb-2 bg-background-light dark:bg-background-dark">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt.text}
                            onClick={() => sendMessage(prompt.text)}
                            className="shrink-0 px-3 sm:px-4 py-2 bg-white dark:bg-surface-dark rounded-full text-xs sm:text-sm font-medium shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 flex items-center gap-1.5 touch-manipulation"
                        >
                            <span>{prompt.icon}</span>
                            {prompt.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area - Mobile Optimized */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-3 sm:p-4 pb-4 sm:pb-6 safe-area-bottom">
                {/* Voice/Text Toggle */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3">
                    <button
                        onClick={() => setIsVoiceMode(false)}
                        className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all touch-manipulation ${!isVoiceMode ? 'bg-primary text-black' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                        ⌨️ Text
                    </button>
                    <button
                        onClick={() => setIsVoiceMode(true)}
                        className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all touch-manipulation ${isVoiceMode ? 'bg-primary text-black' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                        🎤 Voice
                    </button>
                </div>

                {isVoiceMode ? (
                    <div className="flex flex-col items-center gap-2">
                        <VoiceButton size="large" showLabel />
                    </div>
                ) : (
                    <div className="flex gap-2 sm:gap-3">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                            placeholder="Type question..."
                            className="flex-1 h-11 sm:h-12 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 border-none outline-none text-sm sm:text-base"
                        />
                        <button
                            onClick={() => sendMessage(inputText)}
                            disabled={!inputText.trim()}
                            className="size-11 sm:size-12 bg-primary rounded-xl flex items-center justify-center text-black active:scale-90 disabled:opacity-50 transition-all touch-manipulation"
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistant;
