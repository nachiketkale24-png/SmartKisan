import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { mockIrrigationRecommendations, mockCrops } from '../data/mockData';
import { t } from '../i18n/translations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const IrrigationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#F44336';
      case 'Medium':
        return '#FF9800';
      case 'Low':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💧 {t('irrigation', 'hi')}</Text>
        <Text style={styles.headerSubtitle}>Irrigation Management</Text>
      </View>

      {/* New Recommendation Button */}
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate('IrrigationRecommendation', {})}
      >
        <Text style={styles.newButtonIcon}>➕</Text>
        <Text style={styles.newButtonText}>नई सिंचाई सलाह प्राप्त करें</Text>
      </TouchableOpacity>

      {/* Recommendations List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>सिंचाई सलाह</Text>
        {mockIrrigationRecommendations.map((rec) => (
          <TouchableOpacity
            key={rec.id}
            style={styles.recCard}
            onPress={() =>
              navigation.navigate('IrrigationRecommendation', { cropId: rec.cropId })
            }
          >
            <View style={styles.recHeader}>
              <Text style={styles.recCrop}>
                🌾 {rec.cropNameHindi}
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(rec.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{rec.priority}</Text>
              </View>
            </View>
            <View style={styles.recContent}>
              <View style={styles.recWater}>
                <Text style={styles.recWaterIcon}>💧</Text>
                <Text style={styles.recWaterAmount}>{rec.recommendedWater}</Text>
                <Text style={styles.recWaterUnit}>{t('liters', 'hi')}</Text>
              </View>
              <Text style={styles.recReason} numberOfLines={2}>
                {rec.reasonHindi}
              </Text>
            </View>
            <View style={styles.recFooter}>
              <Text style={styles.recSaving}>
                💰 {rec.waterSaving}% पानी की बचत
              </Text>
              <Text style={styles.recArrow}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Crop Water Summary */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>फसल पानी सारांश</Text>
        {mockCrops.map((crop) => (
          <View key={crop.id} style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🌾</Text>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryCrop}>{crop.nameHindi}</Text>
              <Text style={styles.summaryDate}>
                पिछली सिंचाई: {crop.lastIrrigationDate}
              </Text>
            </View>
            <View style={styles.summaryWater}>
              <Text style={styles.summaryWaterValue}>
                {(crop.totalWaterGiven / 1000).toFixed(1)}K
              </Text>
              <Text style={styles.summaryWaterUnit}>लीटर</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BBDEFB',
    marginTop: 4,
  },
  newButton: {
    backgroundColor: '#2E7D32',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  newButtonIcon: {
    fontSize: 20,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  lastSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recCrop: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recContent: {
    marginBottom: 12,
  },
  recWater: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  recWaterIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recWaterAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  recWaterUnit: {
    fontSize: 16,
    color: '#1976D2',
    marginLeft: 4,
  },
  recReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  recSaving: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recArrow: {
    fontSize: 20,
    color: '#2E7D32',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryCrop: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryDate: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  summaryWater: {
    alignItems: 'flex-end',
  },
  summaryWaterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  summaryWaterUnit: {
    fontSize: 12,
    color: '#757575',
  },
});

export default IrrigationScreen;
