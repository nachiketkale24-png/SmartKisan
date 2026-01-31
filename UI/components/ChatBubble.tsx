// AgriGuard Chat Bubble Component
// Mobile-optimized message bubbles

import React from 'react';
import SpeakButton from './SpeakButton';

export interface ChatBubbleProps {
    role: 'user' | 'ai';
    text: string;
    timestamp?: string;
    type?: 'irrigation' | 'fertilizer' | 'weather' | 'health' | 'alert' | 'general';
    isTyping?: boolean;
    showSpeak?: boolean;
    data?: {
        action?: string;
        value?: number;
        unit?: string;
        urgency?: string;
        confidence?: number;
    };
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
    role,
    text,
    timestamp,
    type = 'general',
    isTyping = false,
    showSpeak = true,
    data,
}) => {
    const isUser = role === 'user';

    // Get icon for message type
    const getTypeIcon = () => {
        switch (type) {
            case 'irrigation': return 'water_drop';
            case 'fertilizer': return 'science';
            case 'weather': return 'cloud';
            case 'health': return 'eco';
            case 'alert': return 'warning';
            default: return 'smart_toy';
        }
    };

    // Get color for message type
    const getTypeColor = () => {
        switch (type) {
            case 'irrigation': return 'bg-blue-500';
            case 'fertilizer': return 'bg-amber-500';
            case 'weather': return 'bg-cyan-500';
            case 'health': return 'bg-green-500';
            case 'alert': return 'bg-red-500';
            default: return 'bg-primary';
        }
    };

    // Get urgency badge color
    const getUrgencyColor = () => {
        switch (data?.urgency) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    if (isTyping) {
        return (
            <div className="flex justify-start mb-3">
                <div className="bg-white dark:bg-surface-dark rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
                    <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full ${getTypeColor()} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <div
                className={`
                    max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm
                    ${isUser
                        ? 'bg-primary text-black rounded-br-sm'
                        : 'bg-white dark:bg-surface-dark rounded-bl-sm'
                    }
                `}
            >
                {/* AI Message Header */}
                {!isUser && type !== 'general' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <div className={`size-6 rounded-full ${getTypeColor()} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-sm">{getTypeIcon()}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                            {type === 'irrigation' && 'Irrigation Advice'}
                            {type === 'fertilizer' && 'Fertilizer Advice'}
                            {type === 'weather' && 'Weather Update'}
                            {type === 'health' && 'Crop Health'}
                            {type === 'alert' && 'Alert'}
                        </span>
                        {data?.urgency && (
                            <span className={`${getUrgencyColor()} text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase`}>
                                {data.urgency}
                            </span>
                        )}
                    </div>
                )}

                {/* Message Text */}
                <p className={`text-sm sm:text-base leading-relaxed ${isUser ? '' : 'text-gray-800 dark:text-gray-200'}`}>
                    {text}
                </p>

                {/* Action Badge */}
                {!isUser && data?.action && data?.value && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <span className={`
                                inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold
                                ${data.action === 'irrigate' ? 'bg-blue-100 text-blue-700' :
                                  data.action === 'stop' ? 'bg-red-100 text-red-700' :
                                  data.action === 'wait' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'}
                            `}>
                                <span className="material-symbols-outlined text-sm">
                                    {data.action === 'irrigate' ? 'water_drop' :
                                     data.action === 'stop' ? 'block' :
                                     data.action === 'wait' ? 'schedule' : 'info'}
                                </span>
                                {data.action === 'irrigate' && `💧 ${data.value}${data.unit || 'mm'} paani dein`}
                                {data.action === 'stop' && '🛑 Irrigation band rakhein'}
                                {data.action === 'wait' && '⏳ Wait karein'}
                                {data.action === 'reduce' && '⚠️ Kam paani dein'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Confidence Badge */}
                {!isUser && data?.confidence && (
                    <div className="mt-1">
                        <span className="text-[10px] text-gray-400">
                            {data.confidence}% confident
                        </span>
                    </div>
                )}

                {/* Footer: Timestamp + Speak Button */}
                <div className="flex items-center justify-between mt-2">
                    {timestamp && (
                        <span className={`text-[10px] sm:text-xs ${isUser ? 'text-black/60' : 'text-gray-400'}`}>
                            {timestamp}
                        </span>
                    )}
                    {!isUser && showSpeak && (
                        <SpeakButton text={text} className="size-6 text-[14px]" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
