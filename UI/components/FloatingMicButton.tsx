// AgriGuard Floating Mic Button
// Global voice button visible on all screens

import React from 'react';

interface Props {
    onClick: () => void;
    isListening?: boolean;
}

const FloatingMicButton: React.FC<Props> = ({ onClick, isListening = false }) => {
    return (
        <button
            onClick={onClick}
            className={`
                fixed bottom-20 left-1/2 -translate-x-1/2 z-50
                w-16 h-16 rounded-full
                flex items-center justify-center
                shadow-lg shadow-green-900/30
                transition-all duration-300 ease-out
                active:scale-90
                ${isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
                }
            `}
            aria-label={isListening ? 'Listening...' : 'Start voice command'}
        >
            {/* Ripple rings when listening */}
            {isListening && (
                <>
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                    <span className="absolute inset-[-8px] rounded-full border-2 border-red-400 animate-ping opacity-20" />
                    <span className="absolute inset-[-16px] rounded-full border border-red-300 animate-ping opacity-10" />
                </>
            )}
            
            {/* Mic icon */}
            <span className="material-symbols-outlined text-white text-3xl relative z-10">
                {isListening ? 'graphic_eq' : 'mic'}
            </span>
        </button>
    );
};

export default FloatingMicButton;
