import React, { useState } from 'react';
import SpeakButton from '../components/SpeakButton';

interface Props {
    onBack: () => void;
}

interface Alert {
    id: string;
    type: 'over_irrigation' | 'under_irrigation' | 'weather_cancel';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    details?: string;
}

const mockAlerts: Alert[] = [
    {
        id: '1',
        type: 'over_irrigation',
        message: 'Over Irrigation Alert',
        timestamp: '2 hours ago',
        severity: 'high',
        details: 'Plot A mein zyada paani detect hua. Soil moisture 85% se upar hai.',
    },
    {
        id: '2',
        type: 'weather_cancel',
        message: 'Weather Cancel Alert',
        timestamp: '5 hours ago',
        severity: 'low',
        details: 'Baarish ki wajah se irrigation automatically cancel.',
    },
    {
        id: '3',
        type: 'under_irrigation',
        message: 'Under Irrigation Alert',
        timestamp: 'Yesterday',
        severity: 'medium',
        details: 'Plot B mein soil moisture 30% se kam hai. Paani dena zaroori.',
    },
    {
        id: '4',
        type: 'over_irrigation',
        message: 'Over Irrigation Alert',
        timestamp: '2 days ago',
        severity: 'high',
        details: 'Plot C mein water logging ka khatra. Irrigation band karein.',
    },
];

const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
        case 'over_irrigation': return 'water_damage';
        case 'under_irrigation': return 'water_drop';
        case 'weather_cancel': return 'thunderstorm';
    }
};

const getAlertLabel = (type: Alert['type']) => {
    switch (type) {
        case 'over_irrigation': return 'Over Irrigation';
        case 'under_irrigation': return 'Under Irrigation';
        case 'weather_cancel': return 'Weather Cancel';
    }
};

const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
        case 'high': return { 
            bg: 'bg-red-50 dark:bg-red-900/20', 
            text: 'text-red-600', 
            badge: 'bg-red-500',
            border: 'border-l-red-500',
            iconBg: 'bg-red-100 dark:bg-red-900/40'
        };
        case 'medium': return { 
            bg: 'bg-orange-50 dark:bg-orange-900/20', 
            text: 'text-orange-600', 
            badge: 'bg-orange-500',
            border: 'border-l-orange-500',
            iconBg: 'bg-orange-100 dark:bg-orange-900/40'
        };
        case 'low': return { 
            bg: 'bg-green-50 dark:bg-green-900/20', 
            text: 'text-green-600', 
            badge: 'bg-green-500',
            border: 'border-l-green-500',
            iconBg: 'bg-green-100 dark:bg-green-900/40'
        };
    }
};

const AlertsScreen: React.FC<Props> = ({ onBack }) => {
    const [alerts] = useState<Alert[]>(mockAlerts);
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
    const highCount = alerts.filter(a => a.severity === 'high').length;
    const mediumCount = alerts.filter(a => a.severity === 'medium').length;
    const lowCount = alerts.filter(a => a.severity === 'low').length;

    return (
        <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
            {/* Header - Mobile Optimized */}
            <header className="flex items-center px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm safe-area-top">
                <button onClick={onBack} className="size-10 sm:size-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg sm:text-xl font-bold flex-1 text-center pr-10 sm:pr-12">Alerts</h1>
            </header>

            {/* Alert Summary Banner - Mobile */}
            <div className="bg-gradient-to-r from-green-800 to-blue-800 text-white px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">notifications_active</span>
                        <span className="font-bold text-sm sm:text-lg">{alerts.length} Alerts</span>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                        {highCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{highCount} High</span>
                        )}
                        {mediumCount > 0 && (
                            <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{mediumCount} Med</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Tabs - Mobile */}
            <div className="flex gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-hide">
                {[
                    { key: 'all', label: 'All', count: alerts.length },
                    { key: 'high', label: 'High', count: highCount },
                    { key: 'medium', label: 'Med', count: mediumCount },
                    { key: 'low', label: 'Low', count: lowCount },
                ].map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setFilter(item.key as any)}
                        className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2 transition-all touch-manipulation ${
                            filter === item.key 
                                ? 'bg-primary text-black' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        {item.label}
                        <span className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
                            filter === item.key ? 'bg-black/20' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                            {item.count}
                        </span>
                    </button>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-24 scroll-smooth">
                {/* Alert Cards - Mobile */}
                {filteredAlerts.map((alert) => {
                    const colors = getAlertColor(alert.severity);
                    return (
                        <div
                            key={alert.id}
                            className={`${colors.bg} rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md border-l-4 ${colors.border}`}
                        >
                            <div className="flex items-start gap-2.5 sm:gap-4">
                                {/* Icon */}
                                <div className={`size-12 sm:size-16 rounded-xl sm:rounded-2xl ${colors.iconBg} ${colors.text} flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined text-[24px] sm:text-[32px]">
                                        {getAlertIcon(alert.type)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Badge + Timestamp Row */}
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                        <span className={`${colors.badge} text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase`}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1">
                                            <span className="material-symbols-outlined text-[10px] sm:text-[12px]">schedule</span>
                                            {alert.timestamp}
                                        </span>
                                    </div>
                                    
                                    {/* Alert Title */}
                                    <p className={`text-sm sm:text-lg font-bold ${colors.text} mb-0.5 sm:mb-1`}>
                                        {getAlertLabel(alert.type)}
                                    </p>
                                    
                                    {/* Short Message */}
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                                        {alert.details || alert.message}
                                    </p>
                                </div>

                                {/* Voice Button */}
                                <SpeakButton text={`${alert.message}. ${alert.details || ''}`} className="shrink-0" />
                            </div>
                        </div>
                    );
                })}

                {/* Empty State - Mobile */}
                {filteredAlerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-gray-400">
                        <div className="size-16 sm:size-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 sm:mb-4">
                            <span className="material-symbols-outlined text-3xl sm:text-5xl">notifications_off</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">No Alerts</p>
                        <p className="text-xs sm:text-sm">Koi {filter !== 'all' ? filter + ' priority' : ''} alert nahi hai</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AlertsScreen;
