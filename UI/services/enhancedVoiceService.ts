// AgriGuard Voice Service
// Web Speech API for STT and TTS with Hindi support

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceServiceConfig {
    language: string;
    onResult: (text: string) => void;
    onStatusChange: (status: VoiceStatus) => void;
    onInterimResult?: (text: string) => void;
    onError?: (error: string) => void;
}

class VoiceServiceClass {
    private recognition: any = null;
    private synthesis: SpeechSynthesis | null = null;
    private config: VoiceServiceConfig | null = null;
    private isListening = false;

    constructor() {
        // Initialize Web Speech API
        if (typeof window !== 'undefined') {
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionAPI) {
                this.recognition = new SpeechRecognitionAPI();
            }
            this.synthesis = window.speechSynthesis;
        }
    }

    configure(config: VoiceServiceConfig) {
        this.config = config;
        
        if (this.recognition) {
            this.recognition.lang = config.language || 'hi-IN';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                console.log('[VoiceService] Recognition started');
                this.isListening = true;
                config.onStatusChange('listening');
            };

            this.recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Show interim results
                if (interimTranscript && config.onInterimResult) {
                    config.onInterimResult(interimTranscript);
                }

                // Final result
                if (finalTranscript) {
                    console.log('[VoiceService] Final result:', finalTranscript);
                    config.onStatusChange('processing');
                    config.onResult(finalTranscript.trim());
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error('[VoiceService] Error:', event.error);
                this.isListening = false;
                config.onStatusChange('error');
                if (config.onError) {
                    const errorMessages: Record<string, string> = {
                        'no-speech': 'Kuch sunai nahi diya. Phir se bolein.',
                        'audio-capture': 'Microphone nahi mila.',
                        'not-allowed': 'Microphone permission denied.',
                        'network': 'Network error. Offline mode mein try karein.',
                    };
                    config.onError(errorMessages[event.error] || `Error: ${event.error}`);
                }
            };

            this.recognition.onend = () => {
                console.log('[VoiceService] Recognition ended');
                this.isListening = false;
                if (this.config?.onStatusChange) {
                    // Only set idle if not in another state
                    setTimeout(() => {
                        if (!this.isListening) {
                            this.config?.onStatusChange('idle');
                        }
                    }, 100);
                }
            };
        }
    }

    startListening(): boolean {
        if (!this.recognition) {
            console.error('[VoiceService] Speech recognition not supported');
            this.config?.onError?.('Voice recognition is not supported in this browser.');
            return false;
        }

        if (this.isListening) {
            console.log('[VoiceService] Already listening');
            return true;
        }

        try {
            // Stop any ongoing speech
            this.stopSpeaking();
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('[VoiceService] Failed to start:', error);
            return false;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('[VoiceService] Failed to stop:', error);
            }
        }
        this.isListening = false;
    }

    // Text-to-Speech
    speak(text: string, onComplete?: () => void): boolean {
        if (!this.synthesis) {
            console.error('[VoiceService] Speech synthesis not supported');
            onComplete?.();
            return false;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find Hindi voice, fallback to default
        const voices = this.synthesis.getVoices();
        const hindiVoice = voices.find(v => 
            v.lang.includes('hi') || 
            v.lang.includes('Hindi') ||
            v.name.includes('Hindi')
        );
        
        if (hindiVoice) {
            utterance.voice = hindiVoice;
        }
        
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            console.log('[VoiceService] Speaking:', text.substring(0, 50) + '...');
            this.config?.onStatusChange('speaking');
        };

        utterance.onend = () => {
            console.log('[VoiceService] Speech ended');
            this.config?.onStatusChange('idle');
            onComplete?.();
        };

        utterance.onerror = (event) => {
            console.error('[VoiceService] Speech error:', event);
            this.config?.onStatusChange('idle');
            onComplete?.();
        };

        this.synthesis.speak(utterance);
        return true;
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    isSupported(): boolean {
        return !!this.recognition;
    }

    isSpeaking(): boolean {
        return this.synthesis?.speaking || false;
    }

    getIsListening(): boolean {
        return this.isListening;
    }
}

// Singleton instance
export const voiceService = new VoiceServiceClass();
