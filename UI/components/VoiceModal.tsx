// AgriGuard Voice Modal
// Full-screen WhatsApp-style voice recording modal

import React, { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onResult: (text: string) => void;
    recognizedText: string;
    isListening: boolean;
    status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
    errorMessage?: string;
}

const VoiceModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onResult,
    recognizedText,
    isListening,
    status,
    errorMessage,
}) => {
    const [dots, setDots] = useState('');

    // Animated dots for listening state
    useEffect(() => {
        if (status === 'listening' || status === 'processing') {
            const interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 400);
            return () => clearInterval(interval);
        }
    }, [status]);

    if (!isOpen) return null;

    const getStatusText = () => {
        switch (status) {
            case 'listening':
                return `Sun raha hoon${dots}`;
            case 'processing':
                return `Samajh raha hoon${dots}`;
            case 'speaking':
                return 'Bol raha hoon...';
            case 'error':
                return errorMessage || 'Kuch galat ho gaya';
            default:
                return 'Boliye...';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'listening':
                return 'text-green-400';
            case 'processing':
                return 'text-amber-400';
            case 'speaking':
                return 'text-blue-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col safe-area-top safe-area-bottom">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 text-white/70 hover:text-white active:scale-95"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>
                <h2 className="text-white font-bold text-lg">Voice Command</h2>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                {/* Large Mic Animation */}
                <div className="relative mb-8">
                    {/* Outer rings */}
                    {(status === 'listening' || status === 'processing') && (
                        <>
                            <span className="absolute inset-[-20px] rounded-full border-2 border-green-500/30 animate-ping" 
                                  style={{ animationDuration: '1.5s' }} />
                            <span className="absolute inset-[-40px] rounded-full border border-green-400/20 animate-ping" 
                                  style={{ animationDuration: '2s' }} />
                            <span className="absolute inset-[-60px] rounded-full border border-green-300/10 animate-ping" 
                                  style={{ animationDuration: '2.5s' }} />
                        </>
                    )}
                    
                    {/* Main circle */}
                    <div className={`
                        w-32 h-32 rounded-full flex items-center justify-center
                        transition-all duration-300
                        ${status === 'listening' 
                            ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                            : status === 'processing'
                            ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                            : status === 'speaking'
                            ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                            : status === 'error'
                            ? 'bg-red-500 shadow-lg shadow-red-500/50'
                            : 'bg-gray-700'
                        }
                    `}>
                        <span className={`
                            material-symbols-outlined text-white text-6xl
                            ${status === 'listening' ? 'animate-pulse' : ''}
                        `}>
                            {status === 'listening' ? 'mic' : 
                             status === 'processing' ? 'psychology' :
                             status === 'speaking' ? 'volume_up' :
                             status === 'error' ? 'error' : 'mic'}
                        </span>
                    </div>
                </div>

                {/* Status Text */}
                <p className={`text-2xl font-bold mb-6 ${getStatusColor()}`}>
                    {getStatusText()}
                </p>

                {/* Recognized Text Preview */}
                <div className="w-full max-w-sm min-h-[80px] bg-white/5 rounded-2xl p-4 mb-8">
                    <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">
                        Aapne bola:
                    </p>
                    <p className={`text-white text-lg ${recognizedText ? '' : 'opacity-50'}`}>
                        {recognizedText || 'Kuch bhi boliye...'}
                    </p>
                </div>

                {/* Example Commands */}
                <div className="w-full max-w-sm">
                    <p className="text-white/40 text-xs mb-3 text-center uppercase tracking-wider">
                        Ye bol sakte hain:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[
                            'Alerts dikhao',
                            'Irrigation status',
                            'Aaj paani dena hai?',
                            'Mausam kaisa hai?'
                        ].map((cmd, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-sm"
                            >
                                "{cmd}"
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 pb-8 pt-4 flex gap-4">
                <button
                    onClick={onClose}
                    className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-semibold active:scale-95 transition-transform"
                >
                    Cancel
                </button>
                {recognizedText && (
                    <button
                        onClick={() => onResult(recognizedText)}
                        className="flex-1 py-4 rounded-2xl bg-green-500 text-white font-semibold active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined align-middle mr-2">send</span>
                        Send
                    </button>
                )}
            </div>
        </div>
    );
};

export default VoiceModal;
