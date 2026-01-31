import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface FloatingMicButtonProps {
  onPress: () => void;
  isRecording?: boolean;
}

const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({
  onPress,
  isRecording = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.buttonRecording]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.Text style={styles.icon}>
        {isRecording ? '⏹️' : '🎤'}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  buttonRecording: {
    backgroundColor: '#F44336',
  },
  icon: {
    fontSize: 28,
  },
});

export default FloatingMicButton;
