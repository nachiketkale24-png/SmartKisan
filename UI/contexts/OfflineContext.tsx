import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OfflineState {
    isOnline: boolean;
    isIoTConnected: boolean;
    lastSyncTime: string;
    sensorStatus: 'active' | 'inactive' | 'error';
    cachedWeatherActive: boolean;
    offlineEngineRunning: boolean;
    deviceSearching: boolean;
    // Demo mode additions
    isDemoMode: boolean;
    isOfflineSimulation: boolean;
    batteryLevel: number;
    signalStrength: number;
    pendingSyncCount: number;
}

interface OfflineContextType extends OfflineState {
    simulateDeviceConnect: () => void;
    simulateDeviceDisconnect: () => void;
    triggerSync: () => void;
    toggleDemoMode: () => void;
    toggleOfflineSimulation: () => void;
    setSignalStrength: (strength: number) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<OfflineState>({
        isOnline: false, // Simulate offline-first
        isIoTConnected: false,
        lastSyncTime: 'Today, 10:00 AM',
        sensorStatus: 'inactive',
        cachedWeatherActive: true,
        offlineEngineRunning: true,
        deviceSearching: true,
        // Demo mode defaults
        isDemoMode: true,
        isOfflineSimulation: true,
        batteryLevel: 75,
        signalStrength: 2, // 0-4 bars
        pendingSyncCount: 3,
    });

    // Simulate device auto-detection
    useEffect(() => {
        const timer = setTimeout(() => {
            setState(prev => ({
                ...prev,
                deviceSearching: false,
                isIoTConnected: true,
                sensorStatus: 'active',
            }));
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Battery drain simulation for demo
    useEffect(() => {
        if (!state.isDemoMode) return;
        const interval = setInterval(() => {
            setState(prev => ({
                ...prev,
                batteryLevel: Math.max(20, prev.batteryLevel - 1),
            }));
        }, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [state.isDemoMode]);

    const simulateDeviceConnect = () => {
        setState(prev => ({
            ...prev,
            isIoTConnected: true,
            sensorStatus: 'active',
            deviceSearching: false,
        }));
    };

    const simulateDeviceDisconnect = () => {
        setState(prev => ({
            ...prev,
            isIoTConnected: false,
            sensorStatus: 'inactive',
        }));
    };

    const triggerSync = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        setState(prev => ({
            ...prev,
            lastSyncTime: `Today, ${timeStr}`,
            pendingSyncCount: 0,
        }));
    };

    const toggleDemoMode = () => {
        setState(prev => ({
            ...prev,
            isDemoMode: !prev.isDemoMode,
        }));
    };

    const toggleOfflineSimulation = () => {
        setState(prev => ({
            ...prev,
            isOfflineSimulation: !prev.isOfflineSimulation,
            isOnline: prev.isOfflineSimulation, // Toggle online status
            cachedWeatherActive: !prev.isOfflineSimulation,
            offlineEngineRunning: !prev.isOfflineSimulation,
        }));
    };

    const setSignalStrength = (strength: number) => {
        setState(prev => ({
            ...prev,
            signalStrength: Math.max(0, Math.min(4, strength)),
        }));
    };

    return (
        <OfflineContext.Provider value={{
            ...state,
            simulateDeviceConnect,
            simulateDeviceDisconnect,
            triggerSync,
            toggleDemoMode,
            toggleOfflineSimulation,
            setSignalStrength,
        }}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within OfflineProvider');
    }
    return context;
};
