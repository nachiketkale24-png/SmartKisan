import React, { useState } from 'react';

interface SpeakButtonProps {
    text: string;
    lang?: string;
    className?: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ text, lang = 'hi-IN', className = '' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback: just show visual feedback
            setIsSpeaking(true);
            setTimeout(() => setIsSpeaking(false), 2000);
        }
    };

    return (
        <button
            onClick={handleSpeak}
            className={`
        size-10 flex items-center justify-center rounded-full
        ${isSpeaking
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                }
        active:scale-95 transition-all
        ${className}
      `}
            aria-label="Read aloud"
        >
            <span className="material-symbols-outlined text-[20px]">
                {isSpeaking ? 'volume_up' : 'volume_up'}
            </span>
        </button>
    );
};

export default SpeakButton;
