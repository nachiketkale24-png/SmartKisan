import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import { AIProvider } from './contexts/AIContext';
import { OfflineProvider } from './contexts/OfflineContext';
import SplashScreen from './screens/SplashScreen';
import LanguageSelection from './screens/LanguageSelection';
import LoginScreen from './screens/LoginScreen';
import AppShell from './screens/AppShell';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SPLASH);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.SPLASH:
        return <SplashScreen onComplete={() => navigate(Screen.LANGUAGE)} />;
      case Screen.LANGUAGE:
        return <LanguageSelection onContinue={() => navigate(Screen.LOGIN)} />;
      case Screen.LOGIN:
        return <LoginScreen onLogin={() => navigate(Screen.APP_SHELL)} onBack={() => navigate(Screen.LANGUAGE)} />;
      case Screen.APP_SHELL:
        return <AppShell onLogout={() => navigate(Screen.LOGIN)} />;
      default:
        return <AppShell onLogout={() => navigate(Screen.LOGIN)} />;
    }
  };

  return (
    <AIProvider>
      <OfflineProvider>
        <div className="flex justify-center min-h-screen">
          <div className="w-full max-w-md bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative">
            {renderScreen()}
          </div>
        </div>
      </OfflineProvider>
    </AIProvider>
  );
};

export default App;
