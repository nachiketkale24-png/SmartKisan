// AgriGuard App Shell
// Main app container with bottom navigation and global voice button

import React, { useState, useEffect, useCallback } from 'react';
import { Screen } from '../types';
import { useOffline } from '../contexts/OfflineContext';
import { detectIntent } from '../ai_engine/intentRouter';
import { processUserMessage } from '../ai_engine/responseEngine';
import { voiceService, VoiceStatus } from '../services/enhancedVoiceService';

// Components
import BottomNavigation from '../components/BottomNavigation';
import FloatingMicButton from '../components/FloatingMicButton';
import VoiceModal from '../components/VoiceModal';

// Screens
import Dashboard from './Dashboard';
import SmartIrrigation from './SmartIrrigation';
import AlertsScreen from './AlertsScreen';
import AssistantChatScreen from './AssistantChatScreen';
import CropScanner from './CropScanner';
import InsuranceClaim from './InsuranceClaim';
import DataSync from './DataSync';
import AIAssistant from './AIAssistant';
import OfflineFallback from './OfflineFallback';

interface Props {
    onLogout?: () => void;
}

const AppShell: React.FC<Props> = ({ onLogout }) => {
    const { isOnline } = useOffline();
    
    // Navigation state
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
    const [darkMode, setDarkMode] = useState(false);
    
    // Voice state
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
    const [recognizedText, setRecognizedText] = useState('');
    const [voiceError, setVoiceError] = useState<string | undefined>();
    
    // Alert count (mock)
    const [alertCount, setAlertCount] = useState(3);

    // Initialize voice service
    useEffect(() => {
        voiceService.configure({
            language: 'hi-IN',
            onResult: handleVoiceResult,
            onStatusChange: setVoiceStatus,
            onInterimResult: setRecognizedText,
            onError: (error) => {
                setVoiceError(error);
                setVoiceStatus('error');
            },
        });
    }, []);

    // Handle voice result
    const handleVoiceResult = useCallback((text: string) => {
        console.log('[AppShell] Voice result:', text);
        setRecognizedText(text);
        processVoiceCommand(text);
    }, []);

    // Process voice command and navigate
    const processVoiceCommand = async (text: string) => {
        setVoiceStatus('processing');
        
        // Detect intent
        const intentResult = detectIntent(text);
        console.log('[AppShell] Intent detected:', intentResult);
        
        // Get AI response (returns string)
        const aiResponseText = processUserMessage(text);
        
        // Speak the response
        voiceService.speak(aiResponseText, () => {
            // After speaking, handle navigation
            if (intentResult.navigationTarget) {
                handleNavigation(intentResult.navigationTarget);
                setIsVoiceModalOpen(false);
            }
        });
    };

    // Handle navigation from voice or UI
    const handleNavigation = (target: string | Screen) => {
        console.log('[AppShell] Navigating to:', target);
        
        // Map navigation targets to screens
        const screenMap: Record<string, Screen> = {
            'DASHBOARD': Screen.DASHBOARD,
            'IRRIGATION': Screen.IRRIGATION,
            'ALERTS': Screen.ALERTS,
            'ASSISTANT': Screen.ASSISTANT,
        };
        
        const screen = typeof target === 'string' && screenMap[target] 
            ? screenMap[target] 
            : (target as Screen);
        setCurrentScreen(screen);
        
        // Clear alert badge when viewing alerts
        if (screen === Screen.ALERTS) {
            setAlertCount(0);
        }
    };

    // Navigate specifically for Dashboard (expects Screen type)
    const navigateToScreen = (screen: Screen) => {
        handleNavigation(screen);
    };

    // Open voice modal and start listening
    const handleMicPress = () => {
        setRecognizedText('');
        setVoiceError(undefined);
        setIsVoiceModalOpen(true);
        
        // Start listening after modal opens
        setTimeout(() => {
            voiceService.startListening();
        }, 300);
    };

    // Close voice modal
    const handleCloseVoiceModal = () => {
        voiceService.stopListening();
        voiceService.stopSpeaking();
        setIsVoiceModalOpen(false);
        setVoiceStatus('idle');
    };

    // Manual send from voice modal
    const handleVoiceSend = (text: string) => {
        processVoiceCommand(text);
    };

    // Render current screen content
    const renderScreenContent = () => {
        switch (currentScreen) {
            case Screen.DASHBOARD:
                return (
                    <Dashboard
                        onNavigate={navigateToScreen}
                        toggleDarkMode={() => setDarkMode(!darkMode)}
                        darkMode={darkMode}
                    />
                );
            case Screen.IRRIGATION:
                return <SmartIrrigation onBack={() => navigateToScreen(Screen.DASHBOARD)} />;
            case Screen.ALERTS:
                return <AlertsScreen onBack={() => navigateToScreen(Screen.DASHBOARD)} />;
            case Screen.ASSISTANT:
                return <AssistantChatScreen onBack={() => navigateToScreen(Screen.DASHBOARD)} />;
            case Screen.SCANNER:
                return <CropScanner onBack={() => navigateToScreen(Screen.DASHBOARD)} onClaim={() => navigateToScreen(Screen.CLAIM)} />;
            case Screen.CLAIM:
                return <InsuranceClaim onBack={() => navigateToScreen(Screen.DASHBOARD)} />;
            case Screen.SYNC:
                return <DataSync onBack={() => navigateToScreen(Screen.DASHBOARD)} />;
            case Screen.AI_ASSISTANT:
                return <AIAssistant onBack={() => navigateToScreen(Screen.DASHBOARD)} />;
            case Screen.FALLBACK:
                return <OfflineFallback onBack={() => navigateToScreen(Screen.DASHBOARD)} />;
            default:
                return (
                    <Dashboard
                        onNavigate={navigateToScreen}
                        toggleDarkMode={() => setDarkMode(!darkMode)}
                        darkMode={darkMode}
                    />
                );
        }
    };

    // Check if current screen should show bottom nav
    const showBottomNav = [
        Screen.DASHBOARD,
        Screen.IRRIGATION,
        Screen.ALERTS,
        Screen.ASSISTANT,
    ].includes(currentScreen);

    return (
        <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark relative overflow-hidden">
            {/* Main Content */}
            <main className={`flex-1 overflow-auto ${showBottomNav ? 'pb-32' : ''}`}>
                {renderScreenContent()}
            </main>

            {/* Global Floating Mic Button - Always visible */}
            <FloatingMicButton
                onClick={handleMicPress}
                isListening={voiceStatus === 'listening'}
            />

            {/* Bottom Navigation - Only on main screens */}
            {showBottomNav && (
                <BottomNavigation
                    currentScreen={currentScreen}
                    onNavigate={navigateToScreen}
                    alertCount={alertCount}
                />
            )}

            {/* Voice Modal - Full screen overlay */}
            <VoiceModal
                isOpen={isVoiceModalOpen}
                onClose={handleCloseVoiceModal}
                onResult={handleVoiceSend}
                recognizedText={recognizedText}
                isListening={voiceStatus === 'listening'}
                status={voiceStatus}
                errorMessage={voiceError}
            />
        </div>
    );
};

export default AppShell;
