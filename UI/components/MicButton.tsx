// AgriGuard Mic Button Component
// Large, accessible mic button for voice-first interaction

import React, { useEffect, useState } from 'react';

export interface MicButtonProps {
    size?: 'small' | 'medium' | 'large' | 'hero';
    isListening?: boolean;
    disabled?: boolean;
    onPress?: () => void;
    showLabel?: boolean;
    label?: string;
    className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({
    size = 'large',
    isListening = false,
    disabled = false,
    onPress,
    showLabel = false,
    label,
    className = '',
}) => {
    const [pulseRings, setPulseRings] = useState<number[]>([]);

    // Animated pulse rings when listening
    useEffect(() => {
        if (isListening) {
            const interval = setInterval(() => {
                setPulseRings(prev => {
                    const newRings = [...prev, Date.now()].slice(-3);
                    return newRings;
                });
            }, 600);
            return () => clearInterval(interval);
        } else {
            setPulseRings([]);
        }
    }, [isListening]);

    const sizeClasses = {
        small: {
            button: 'size-12 sm:size-14',
            icon: 'text-[24px] sm:text-[28px]',
            ring: 'size-16 sm:size-18',
        },
        medium: {
            button: 'size-14 sm:size-16',
            icon: 'text-[28px] sm:text-[32px]',
            ring: 'size-20 sm:size-22',
        },
        large: {
            button: 'size-16 sm:size-20',
            icon: 'text-[32px] sm:text-[40px]',
            ring: 'size-24 sm:size-28',
        },
        hero: {
            button: 'size-24 sm:size-32',
            icon: 'text-[48px] sm:text-[64px]',
            ring: 'size-32 sm:size-40',
        },
    };

    const currentSize = sizeClasses[size];

    const getLabel = () => {
        if (label) return label;
        if (isListening) return 'Listening... Boliye';
        return 'Tap to speak';
    };

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            {/* Pulse rings container */}
            <div className="relative flex items-center justify-center">
                {/* Animated pulse rings */}
                {isListening && pulseRings.map((id, index) => (
                    <div
                        key={id}
                        className={`
                            absolute rounded-full border-2 border-red-400
                            animate-ping opacity-0
                        `}
                        style={{
                            width: size === 'hero' ? '140%' : '130%',
                            height: size === 'hero' ? '140%' : '130%',
                            animationDuration: '1.5s',
                            animationDelay: `${index * 0.2}s`,
                        }}
                    />
                ))}

                {/* Static glow ring when listening */}
                {isListening && (
                    <div
                        className={`
                            absolute rounded-full bg-red-500/20
                            animate-pulse
                        `}
                        style={{
                            width: '150%',
                            height: '150%',
                        }}
                    />
                )}

                {/* Main button */}
                <button
                    onClick={onPress}
                    disabled={disabled}
                    className={`
                        ${currentSize.button}
                        flex items-center justify-center rounded-full relative z-10
                        ${isListening
                            ? 'bg-red-500 shadow-lg shadow-red-500/50'
                            : 'bg-gradient-to-br from-primary to-green-600 shadow-lg shadow-primary/30'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 hover:scale-105'}
                        text-white transition-all duration-200 touch-manipulation
                    `}
                    aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                >
                    <span className={`material-symbols-outlined ${currentSize.icon}`}>
                        {isListening ? 'mic' : 'mic'}
                    </span>

                    {/* Active indicator dot */}
                    {isListening && (
                        <span className="absolute -top-1 -right-1 flex size-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-4 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </button>
            </div>

            {/* Label */}
            {showLabel && (
                <div className="text-center">
                    <span className={`
                        text-sm sm:text-base font-semibold
                        ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-600 dark:text-gray-300'}
                    `}>
                        {getLabel()}
                    </span>
                    {size === 'hero' && !isListening && (
                        <p className="text-xs text-gray-400 mt-1">
                            Hindi, English ya Hinglish mein bolein
                        </p>
                    )}
                </div>
            )}

            {/* Listening animation bars */}
            {isListening && size === 'hero' && (
                <div className="flex items-end gap-1 h-8 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="w-2 bg-red-500 rounded-full animate-pulse"
                            style={{
                                height: `${Math.random() * 24 + 8}px`,
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.5s',
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MicButton;
