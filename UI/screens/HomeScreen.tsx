// AgriGuard Home Screen
// Voice-first landing screen with large mic button

import React from 'react';
import MicButton from '../components/MicButton';
import { Screen } from '../types';
import { useOffline } from '../contexts/OfflineContext';

interface Props {
    onNavigate: (screen: Screen) => void;
}

const HomeScreen: React.FC<Props> = ({ onNavigate }) => {
    const { isOnline, isOfflineSimulation } = useOffline();
    const isOfflineMode = isOfflineSimulation || !isOnline;

    const handleMicPress = () => {
        // Navigate to Assistant Chat Screen
        onNavigate(Screen.AI);
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-b from-green-900 via-green-800 to-green-900 safe-area-top safe-area-bottom">
            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="size-20 sm:size-24 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl sm:text-5xl">
                            agriculture
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                        Kisan Sahayak
                    </h1>
                    <p className="text-lg text-green-200">
                        AgriGuard AI Assistant
                    </p>
                </div>

                {/* Hero Mic Button */}
                <div className="my-8">
                    <MicButton
                        size="hero"
                        onPress={handleMicPress}
                        showLabel={true}
                        label="Tap to talk"
                    />
                </div>

                {/* Instructions */}
                <div className="text-center max-w-xs">
                    <p className="text-white/80 text-base sm:text-lg mb-4">
                        Mic button dabayein aur bolein:
                    </p>
                    <div className="space-y-2">
                        {[
                            '"Aaj paani dena hai?"',
                            '"Fertilizer advice do"',
                            '"Mausam kaisa hai?"',
                            '"Fasal kaisi hai?"',
                        ].map((example, i) => (
                            <p key={i} className="text-green-200 text-sm italic">
                                {example}
                            </p>
                        ))}
                    </div>
                </div>
            </main>

            {/* Quick Actions Footer */}
            <footer className="px-4 pb-6 pt-4 bg-black/20 backdrop-blur-sm">
                <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                    {[
                        { icon: 'water_drop', label: 'Irrigation', screen: Screen.IRRIGATION },
                        { icon: 'notifications', label: 'Alerts', screen: Screen.ALERTS },
                        { icon: 'edit_note', label: 'Manual', screen: Screen.FALLBACK },
                        { icon: 'dashboard', label: 'Dashboard', screen: Screen.DASHBOARD },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => onNavigate(item.screen)}
                            className="flex flex-col items-center gap-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all touch-manipulation"
                        >
                            <span className="material-symbols-outlined text-white text-2xl">
                                {item.icon}
                            </span>
                            <span className="text-white text-[10px] font-medium">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default HomeScreen;
