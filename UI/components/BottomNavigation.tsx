// AgriGuard Bottom Navigation
// Main app navigation with 4 tabs

import React from 'react';
import { Screen } from '../types';

interface NavItem {
    id: Screen;
    label: string;
    labelHindi: string;
    icon: string;
}

const NAV_ITEMS: NavItem[] = [
    { id: Screen.DASHBOARD, label: 'Dashboard', labelHindi: 'होम', icon: 'dashboard' },
    { id: Screen.IRRIGATION, label: 'Irrigation', labelHindi: 'सिंचाई', icon: 'water_drop' },
    { id: Screen.ALERTS, label: 'Alerts', labelHindi: 'अलर्ट', icon: 'notifications' },
    { id: Screen.ASSISTANT, label: 'Assistant', labelHindi: 'सहायक', icon: 'smart_toy' },
];

interface Props {
    currentScreen: Screen;
    onNavigate: (screen: Screen) => void;
    alertCount?: number;
}

const BottomNavigation: React.FC<Props> = ({ currentScreen, onNavigate, alertCount = 0 }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
            <div className="max-w-md mx-auto flex items-center justify-around h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = currentScreen === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                flex flex-col items-center justify-center
                                flex-1 h-full
                                transition-colors duration-200
                                active:bg-gray-100 dark:active:bg-gray-800
                                ${isActive 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }
                            `}
                        >
                            <div className="relative">
                                <span className={`
                                    material-symbols-outlined text-2xl
                                    ${isActive ? 'font-bold' : ''}
                                `}>
                                    {item.icon}
                                </span>
                                
                                {/* Alert badge */}
                                {item.id === Screen.ALERTS && alertCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                        {alertCount > 9 ? '9+' : alertCount}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                                {item.labelHindi}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavigation;
