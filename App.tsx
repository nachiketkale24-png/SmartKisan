import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import FloatingMicButton from './src/components/FloatingMicButton';
import VoiceModal from './src/components/VoiceModal';

export default function App() {
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleMicPress = () => {
    setIsVoiceModalVisible(true);
  };

  const handleVoiceModalClose = () => {
    setIsVoiceModalVisible(false);
    setIsRecording(false);
  };

  const handleVoiceResult = (text: string) => {
    console.log('Voice result:', text);
    // Handle the voice command here
    // You can navigate to different screens or perform actions based on the text
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <AppNavigator />
          
          {/* Global Floating Mic Button */}
          <FloatingMicButton
            onPress={handleMicPress}
            isRecording={isRecording}
          />
          
          {/* Voice Modal */}
          <VoiceModal
            visible={isVoiceModalVisible}
            onClose={handleVoiceModalClose}
            onVoiceResult={handleVoiceResult}
          />
          
          <StatusBar style="light" />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
