import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import IrrigationScreen from '../screens/IrrigationScreen';
import AlertsScreen from '../screens/AlertsScreen';
import AssistantScreen from '../screens/AssistantScreen';
import CropDetailsScreen from '../screens/CropDetailsScreen';
import IrrigationRecommendationScreen from '../screens/IrrigationRecommendationScreen';
import DiseaseDetailsScreen from '../screens/DiseaseDetailsScreen';

import { RootStackParamList, TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabIcon: React.FC<{ icon: string; label: string; focused: boolean }> = ({
  icon,
  label,
  focused,
}) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="डैशबोर्ड" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Irrigation"
        component={IrrigationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💧" label="सिंचाई" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🔔" label="अलर्ट" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🤖" label="सहायक" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="CropDetails"
        component={CropDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'फसल विवरण',
          headerTintColor: '#FFFFFF',
          headerStyle: { backgroundColor: '#2E7D32' },
        }}
      />
      <Stack.Screen
        name="IrrigationRecommendation"
        component={IrrigationRecommendationScreen}
        options={{
          headerShown: true,
          headerTitle: 'सिंचाई सलाह',
          headerTintColor: '#FFFFFF',
          headerStyle: { backgroundColor: '#1976D2' },
        }}
      />
      <Stack.Screen
        name="DiseaseDetails"
        component={DiseaseDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'रोग विवरण',
          headerTintColor: '#FFFFFF',
          headerStyle: { backgroundColor: '#FF9800' },
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconFocused: {
    fontSize: 28,
  },
  tabLabel: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default AppNavigator;
