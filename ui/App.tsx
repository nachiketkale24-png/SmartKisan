
import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import { AppProvider } from './context/AppContext';
import VoiceButton from './components/VoiceButton';
import SplashScreen from './screens/SplashScreen';
import LanguageSelection from './screens/LanguageSelection';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import CropScanner from './screens/CropScanner';
import AIChat from './screens/AIChat';
import SmartIrrigation from './screens/SmartIrrigation';
import InsuranceClaim from './screens/InsuranceClaim';
import DataSync from './screens/DataSync';
import AlertsScreen from './screens/AlertsScreen';
import OfflineInputScreen from './screens/OfflineInputScreen';
import VoiceAssistantScreen from './screens/VoiceAssistantScreen';

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SPLASH);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // Check if we should show the voice button (not on splash/language/login)
  const showVoiceButton = ![Screen.SPLASH, Screen.LANGUAGE, Screen.LOGIN].includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.SPLASH:
        return <SplashScreen onComplete={() => navigate(Screen.LANGUAGE)} />;
      case Screen.LANGUAGE:
        return <LanguageSelection onContinue={() => navigate(Screen.LOGIN)} />;
      case Screen.LOGIN:
        return <LoginScreen onLogin={() => navigate(Screen.DASHBOARD)} onBack={() => navigate(Screen.LANGUAGE)} />;
      case Screen.DASHBOARD:
        return (
          <Dashboard 
            onNavigate={navigate} 
            toggleDarkMode={() => setDarkMode(!darkMode)} 
            darkMode={darkMode}
          />
        );
      case Screen.SCANNER:
        return <CropScanner onBack={() => navigate(Screen.DASHBOARD)} onClaim={() => navigate(Screen.CLAIM)} />;
      case Screen.CHAT:
        return <AIChat onBack={() => navigate(Screen.DASHBOARD)} />;
      case Screen.IRRIGATION:
        return <SmartIrrigation onBack={() => navigate(Screen.DASHBOARD)} />;
      case Screen.CLAIM:
        return <InsuranceClaim onBack={() => navigate(Screen.DASHBOARD)} />;
      case Screen.SYNC:
        return <DataSync onBack={() => navigate(Screen.DASHBOARD)} />;
      case Screen.ALERTS:
        return <AlertsScreen onBack={() => navigate(Screen.DASHBOARD)} onNavigate={navigate} />;
      case Screen.OFFLINE_INPUT:
        return <OfflineInputScreen onBack={() => navigate(Screen.DASHBOARD)} onNavigate={navigate} />;
      case Screen.VOICE_ASSISTANT:
        return <VoiceAssistantScreen onBack={() => navigate(Screen.DASHBOARD)} onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-md bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative">
        {renderScreen()}
        {/* Global Voice Assistant Button */}
        {showVoiceButton && <VoiceButton onNavigate={navigate} />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
