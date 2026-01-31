// AgriGuard Voice Service - Speech Recognition & Synthesis
// Works offline with Web Speech API fallback

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'responding' | 'error';

export interface VoiceResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

export interface VoiceServiceConfig {
    language: string;
    continuous: boolean;
    interimResults: boolean;
    onResult: (result: VoiceResult) => void;
    onStatusChange: (status: VoiceStatus) => void;
    onError: (error: string) => void;
}

class VoiceService {
    private recognition: any = null;
    private synthesis: SpeechSynthesis | null = null;
    private isListening: boolean = false;
    private config: VoiceServiceConfig | null = null;

    constructor() {
        // Initialize Web Speech API
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            console.log('[VoiceService] Speech Recognition initialized');
        } else {
            console.warn('[VoiceService] Speech Recognition not supported');
        }

        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            console.log('[VoiceService] Speech Synthesis initialized');
        }
    }

    // Check if voice is supported
    isSupported(): boolean {
        return this.recognition !== null;
    }

    // Configure voice service
    configure(config: VoiceServiceConfig): void {
        this.config = config;
        
        if (this.recognition) {
            this.recognition.lang = config.language || 'hi-IN';
            this.recognition.continuous = config.continuous || false;
            this.recognition.interimResults = config.interimResults || true;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event: any) => {
                const result = event.results[event.results.length - 1];
                const transcript = result[0].transcript;
                const confidence = result[0].confidence;
                const isFinal = result.isFinal;

                console.log('[VoiceService] Result:', { transcript, confidence, isFinal });
                
                config.onResult({
                    transcript,
                    confidence: Math.round(confidence * 100),
                    isFinal,
                });

                if (isFinal) {
                    config.onStatusChange('processing');
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error('[VoiceService] Error:', event.error);
                this.isListening = false;
                config.onStatusChange('error');
                config.onError(this.getErrorMessage(event.error));
            };

            this.recognition.onend = () => {
                console.log('[VoiceService] Recognition ended');
                this.isListening = false;
                if (this.config?.onStatusChange) {
                    // Don't change status if we're processing
                }
            };

            this.recognition.onstart = () => {
                console.log('[VoiceService] Recognition started');
                this.isListening = true;
                config.onStatusChange('listening');
            };
        }
    }

    // Start listening
    startListening(): boolean {
        if (!this.recognition) {
            console.error('[VoiceService] Recognition not available');
            return false;
        }

        if (this.isListening) {
            console.warn('[VoiceService] Already listening');
            return true;
        }

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('[VoiceService] Start error:', error);
            return false;
        }
    }

    // Stop listening
    stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Speak text (TTS)
    speak(text: string, lang: string = 'hi-IN'): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                console.warn('[VoiceService] Synthesis not available');
                resolve();
                return;
            }

            // Cancel any ongoing speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to find Hindi voice
            const voices = this.synthesis.getVoices();
            const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
            if (hindiVoice) {
                utterance.voice = hindiVoice;
            }

            utterance.onend = () => {
                console.log('[VoiceService] Speech ended');
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('[VoiceService] Speech error:', event);
                reject(event);
            };

            this.config?.onStatusChange('responding');
            this.synthesis.speak(utterance);
        });
    }

    // Stop speaking
    stopSpeaking(): void {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    // Get current listening state
    getIsListening(): boolean {
        return this.isListening;
    }

    // Get user-friendly error message
    private getErrorMessage(error: string): string {
        const errorMessages: Record<string, string> = {
            'no-speech': 'Koi awaaz nahi suni. Phir se bolein.',
            'audio-capture': 'Microphone nahi mil raha. Permission check karein.',
            'not-allowed': 'Microphone permission denied. Settings mein allow karein.',
            'network': 'Network error. Offline mode mein kaam kar rahe hain.',
            'aborted': 'Voice input cancelled.',
            'service-not-allowed': 'Speech service not available.',
        };
        return errorMessages[error] || 'Voice error. Phir se try karein.';
    }
}

// Singleton instance
export const voiceService = new VoiceService();
export default voiceService;
