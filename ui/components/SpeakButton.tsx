
import React from 'react';
import { useAI } from '../context/AppContext';

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// SPEAK BUTTON - Text-to-Speech Component
// Click to hear recommendations spoken aloud
// ============================================
const SpeakButton: React.FC<SpeakButtonProps> = ({ text, className = '', size = 'md' }) => {
  const { speakText, isSpeaking } = useAI();

  const sizeClasses = {
    sm: 'size-8 text-[16px]',
    md: 'size-10 text-[20px]',
    lg: 'size-12 text-[24px]'
  };

  return (
    <button
      onClick={() => speakText(text)}
      className={`rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center active:scale-95 transition-all ${
        isSpeaking ? 'animate-pulse bg-blue-200 dark:bg-blue-800/50' : ''
      } ${sizeClasses[size]} ${className}`}
      title="Click to hear"
    >
      <span className={`material-symbols-outlined text-blue-600 ${isSpeaking ? 'animate-bounce' : ''}`}>
        {isSpeaking ? 'volume_up' : 'volume_up'}
      </span>
    </button>
  );
};

export default SpeakButton;
