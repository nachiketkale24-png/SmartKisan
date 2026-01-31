import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { t } from '../i18n/translations';

const { width, height } = Dimensions.get('window');

interface VoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onVoiceResult?: (text: string) => void;
}

const VoiceModal: React.FC<VoiceModalProps> = ({
  visible,
  onClose,
  onVoiceResult,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.log('Permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsListening(true);
      setTranscript('');

      // Speak prompt
      Speech.speak('बोलिए, मैं सुन रहा हूं', { language: 'hi-IN' });
    } catch (error) {
      console.log('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsListening(false);

      // Demo transcript (in real app, send audio to speech-to-text service)
      const demoTranscripts = [
        'गेहूं में कितना पानी दूं?',
        'आज सिंचाई करनी चाहिए क्या?',
        'फसल की स्थिति बताओ',
        'खाद कब डालनी है?',
      ];
      const randomTranscript =
        demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
      
      setTranscript(randomTranscript);

      // Speak confirmation
      Speech.speak(`आपने कहा: ${randomTranscript}`, { language: 'hi-IN' });

      if (onVoiceResult) {
        onVoiceResult(randomTranscript);
      }
    } catch (error) {
      console.log('Error stopping recording:', error);
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleClose = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsListening(false);
    setTranscript('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>
            {isListening ? t('listening', 'hi') : t('tapToSpeak', 'hi')}
          </Text>

          {/* Mic Button */}
          <View style={styles.micContainer}>
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: isListening ? 0.3 : 0,
                },
              ]}
            />
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={handleMicPress}
            >
              <Text style={styles.micIcon}>{isListening ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
          </View>

          {/* Status Text */}
          <Text style={styles.statusText}>
            {isListening
              ? 'बोलिए...'
              : transcript
              ? 'आपने कहा:'
              : 'माइक पर टैप करें'}
          </Text>

          {/* Transcript */}
          {transcript ? (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcript}>{transcript}</Text>
            </View>
          ) : null}

          {/* Wave Animation (simple dots) */}
          {isListening && (
            <View style={styles.waveContainer}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveDot,
                    {
                      height: 20 + Math.random() * 30,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Language Indicator */}
          <View style={styles.languageContainer}>
            <Text style={styles.languageText}>🇮🇳 हिंदी / Hinglish</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 40,
  },
  micContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  pulseCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4CAF50',
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  micButtonActive: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
  },
  micIcon: {
    fontSize: 40,
  },
  statusText: {
    fontSize: 18,
    color: '#9E9E9E',
    marginBottom: 20,
  },
  transcriptContainer: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 20,
  },
  transcript: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    height: 50,
  },
  waveDot: {
    width: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  languageContainer: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default VoiceModal;
