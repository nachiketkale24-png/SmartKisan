import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, Crop } from '../types';
import { getCropById } from '../data/mockData';
import { t } from '../i18n/translations';
import voiceService from '../services/voiceService';

type CropDetailsRouteProp = RouteProp<RootStackParamList, 'CropDetails'>;

const CropDetailsScreen: React.FC = () => {
  const route = useRoute<CropDetailsRouteProp>();
  const { cropId } = route.params;
  const crop = getCropById(cropId);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!crop) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('noData', 'hi')}</Text>
      </View>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Good':
        return '#4CAF50';
      case 'Warning':
        return '#FF9800';
      case 'Critical':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getFertilizerLabel = (type: string) => {
    switch (type) {
      case 'Organic':
        return t('organic', 'hi');
      case 'Chemical':
        return t('chemical', 'hi');
      case 'Mixed':
        return t('mixed', 'hi');
      default:
        return type;
    }
  };

  const handleListenSummary = async () => {
    if (isSpeaking) {
      await voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    const recommendation =
      crop.healthStatus === 'Good'
        ? 'फसल की स्थिति अच्छी है। नियमित सिंचाई जारी रखें।'
        : crop.healthStatus === 'Warning'
        ? 'फसल को अतिरिक्त देखभाल की जरूरत है। सिंचाई और खाद पर ध्यान दें।'
        : 'फसल की स्थिति गंभीर है। तुरंत विशेषज्ञ से संपर्क करें।';

    try {
      await voiceService.speakCropSummary(
        crop.nameHindi,
        crop.healthStatus === 'Good'
          ? t('good', 'hi')
          : crop.healthStatus === 'Warning'
          ? t('warning', 'hi')
          : t('critical', 'hi'),
        crop.lastIrrigationDate,
        recommendation,
        true
      );
    } catch (error) {
      console.log('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const renderInfoCard = (icon: string, label: string, value: string) => (
    <View style={styles.infoCard}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.cropEmoji}>🌾</Text>
        <View style={styles.headerContent}>
          <Text style={styles.cropName}>{crop.nameHindi}</Text>
          <Text style={styles.cropNameEn}>{crop.name}</Text>
        </View>
        <View
          style={[
            styles.healthBadge,
            { backgroundColor: getHealthColor(crop.healthStatus) },
          ]}
        >
          <Text style={styles.healthText}>
            {crop.healthStatus === 'Good'
              ? t('good', 'hi')
              : crop.healthStatus === 'Warning'
              ? t('warning', 'hi')
              : t('critical', 'hi')}
          </Text>
        </View>
      </View>

      {/* Listen Summary Button */}
      <TouchableOpacity
        style={[styles.listenButton, isSpeaking && styles.listenButtonActive]}
        onPress={handleListenSummary}
      >
        {isSpeaking ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.listenButtonText}>रुकें...</Text>
          </>
        ) : (
          <>
            <Text style={styles.listenButtonIcon}>🔊</Text>
            <Text style={styles.listenButtonText}>{t('listenSummary', 'hi')}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('cropDetails', 'hi')}</Text>
        <View style={styles.infoGrid}>
          {renderInfoCard('📅', t('plantationDate', 'hi'), crop.plantationDate)}
          {renderInfoCard(
            '📏',
            t('area', 'hi'),
            `${crop.area} ${crop.areaUnit === 'acre' ? t('acre', 'hi') : t('hectare', 'hi')}`
          )}
          {renderInfoCard('🌱', t('stage', 'hi'), crop.growthStage)}
          {renderInfoCard('💧', t('lastIrrigation', 'hi'), crop.lastIrrigationDate)}
        </View>
      </View>

      {/* Water & Fertilizer */}
      <View style={styles.section}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={styles.statValue}>
              {(crop.totalWaterGiven / 1000).toFixed(1)}K
            </Text>
            <Text style={styles.statLabel}>{t('totalWater', 'hi')}</Text>
            <Text style={styles.statUnit}>{t('liters', 'hi')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌱</Text>
            <Text style={styles.statValue}>{crop.fertilizerDates.length}</Text>
            <Text style={styles.statLabel}>{t('fertilizerType', 'hi')}</Text>
            <Text style={styles.statUnit}>{getFertilizerLabel(crop.fertilizerType)}</Text>
          </View>
        </View>
      </View>

      {/* Fertilizer Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('fertilizerDates', 'hi')}</Text>
        <View style={styles.datesList}>
          {crop.fertilizerDates.map((date, index) => (
            <View key={index} style={styles.dateItem}>
              <Text style={styles.dateNumber}>{index + 1}</Text>
              <Text style={styles.dateText}>{date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Sensor Data */}
      {crop.sensorData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sensorData', 'hi')}</Text>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorIcon}>🌡️</Text>
              <Text style={styles.sensorValue}>{crop.sensorData.temperature}°C</Text>
              <Text style={styles.sensorLabel}>{t('temperature', 'hi').split(' ')[0]}</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorIcon}>💦</Text>
              <Text style={styles.sensorValue}>{crop.sensorData.soilMoisture}%</Text>
              <Text style={styles.sensorLabel}>नमी</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorIcon}>☁️</Text>
              <Text style={styles.sensorValue}>{crop.sensorData.humidity}%</Text>
              <Text style={styles.sensorLabel}>आर्द्रता</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorIcon}>⚗️</Text>
              <Text style={styles.sensorValue}>{crop.sensorData.soilPH}</Text>
              <Text style={styles.sensorLabel}>pH</Text>
            </View>
          </View>
          <Text style={styles.sensorUpdate}>
            अपडेट: {new Date(crop.sensorData.lastUpdated).toLocaleString('hi-IN')}
          </Text>
        </View>
      )}

      {/* Disease History */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>{t('diseaseHistory', 'hi')}</Text>
        {crop.diseaseHistory.length > 0 ? (
          crop.diseaseHistory.map((disease) => (
            <View key={disease.id} style={styles.diseaseCard}>
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseIcon}>⚠️</Text>
                <View style={styles.diseaseInfo}>
                  <Text style={styles.diseaseName}>{disease.diseaseNameHindi}</Text>
                  <Text style={styles.diseaseDate}>{disease.detectedDate}</Text>
                </View>
                <View
                  style={[
                    styles.diseaseStatus,
                    {
                      backgroundColor:
                        disease.status === 'Active'
                          ? '#F44336'
                          : disease.status === 'Under Treatment'
                          ? '#FF9800'
                          : '#4CAF50',
                    },
                  ]}
                >
                  <Text style={styles.diseaseStatusText}>
                    {disease.status === 'Active'
                      ? t('active', 'hi')
                      : disease.status === 'Under Treatment'
                      ? t('underTreatment', 'hi')
                      : t('recovered', 'hi')}
                  </Text>
                </View>
              </View>
              <Text style={styles.diseaseTreatment}>{disease.treatmentHindi}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noDisease}>
            <Text style={styles.noDiseaseIcon}>✅</Text>
            <Text style={styles.noDiseaseText}>कोई रोग नहीं पाया गया</Text>
          </View>
        )}
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
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropEmoji: {
    fontSize: 50,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  cropName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cropNameEn: {
    fontSize: 16,
    color: '#C8E6C9',
    marginTop: 4,
  },
  healthBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  healthText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listenButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  listenButtonActive: {
    backgroundColor: '#F44336',
  },
  listenButtonIcon: {
    fontSize: 24,
  },
  listenButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lastSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    width: '47%',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  statUnit: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  datesList: {
    gap: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  dateNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sensorCard: {
    width: '47%',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sensorIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E65100',
  },
  sensorLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  sensorUpdate: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 12,
  },
  diseaseCard: {
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  diseaseIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  diseaseDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  diseaseStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  diseaseStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  diseaseTreatment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noDisease: {
    alignItems: 'center',
    padding: 20,
  },
  noDiseaseIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  noDiseaseText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#757575',
  },
});

export default CropDetailsScreen;
