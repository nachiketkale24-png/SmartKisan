import React from 'react';
import { useAI } from '../contexts/AIContext';

interface VoiceButtonProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
    showLabel?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ size = 'large', className = '', showLabel = false }) => {
    const { isListening, startListening, stopListening } = useAI();

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const sizeClasses = {
        small: 'size-10 sm:size-12 text-[20px] sm:text-[24px]',
        medium: 'size-12 sm:size-14 text-[24px] sm:text-[28px]',
        large: 'size-14 sm:size-16 text-[28px] sm:text-[32px]',
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <button
                onClick={handleClick}
                className={`
                    ${sizeClasses[size]}
                    flex items-center justify-center rounded-full relative
                    ${isListening
                        ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                        : 'bg-gradient-to-br from-primary to-green-600 shadow-lg shadow-primary/30'
                    }
                    text-white active:scale-90 transition-all duration-200
                    touch-manipulation
                    ${className}
                `}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
                <span className="material-symbols-outlined">
                    {isListening ? 'mic' : 'mic'}
                </span>
                {isListening && (
                    <span className="absolute -top-1 -right-1 flex size-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-4 bg-red-500"></span>
                    </span>
                )}
            </button>
            {showLabel && (
                <span className={`text-xs font-medium ${isListening ? 'text-red-500' : 'text-gray-500'}`}>
                    {isListening ? 'Listening...' : 'Tap to speak'}
                </span>
            )}
        </div>
    );
};

export default VoiceButton;
