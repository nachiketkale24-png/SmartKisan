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
import { RootStackParamList, DiseaseRecord } from '../types';
import { getDiseaseById } from '../data/mockData';
import { t } from '../i18n/translations';
import voiceService from '../services/voiceService';

type DiseaseDetailsRouteProp = RouteProp<RootStackParamList, 'DiseaseDetails'>;

const DiseaseDetailsScreen: React.FC = () => {
  const route = useRoute<DiseaseDetailsRouteProp>();
  const { diseaseId } = route.params;
  const disease = getDiseaseById(diseaseId);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!disease) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('noData', 'hi')}</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recovered':
        return '#4CAF50';
      case 'Under Treatment':
        return '#FF9800';
      case 'Active':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return '#4CAF50';
      case 'Medium':
        return '#FF9800';
      case 'High':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const handleListenInfo = async () => {
    if (isSpeaking) {
      await voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await voiceService.speakDiseaseInfo(
        disease.diseaseNameHindi,
        disease.cropName,
        disease.status === 'Active'
          ? t('active', 'hi')
          : disease.status === 'Under Treatment'
          ? t('underTreatment', 'hi')
          : t('recovered', 'hi'),
        disease.treatmentHindi,
        true
      );
    } catch (error) {
      console.log('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <View style={styles.headerContent}>
          <Text style={styles.diseaseName}>{disease.diseaseNameHindi}</Text>
          <Text style={styles.diseaseNameEn}>{disease.diseaseName}</Text>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>{t('status', 'hi')}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(disease.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {disease.status === 'Active'
                  ? t('active', 'hi')
                  : disease.status === 'Under Treatment'
                  ? t('underTreatment', 'hi')
                  : t('recovered', 'hi')}
              </Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>{t('severity', 'hi')}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getSeverityColor(disease.severity) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {disease.severity === 'Low'
                  ? t('low', 'hi')
                  : disease.severity === 'Medium'
                  ? t('medium', 'hi')
                  : t('high', 'hi')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🌾</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>फसल का नाम</Text>
            <Text style={styles.infoValue}>{disease.cropName}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📅</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('detectedOn', 'hi')}</Text>
            <Text style={styles.infoValue}>{disease.detectedDate}</Text>
          </View>
        </View>
      </View>

      {/* Treatment Section */}
      <View style={styles.treatmentSection}>
        <Text style={styles.treatmentTitle}>{t('treatment', 'hi')}</Text>
        <View style={styles.treatmentCard}>
          <Text style={styles.treatmentIcon}>💊</Text>
          <Text style={styles.treatmentText}>{disease.treatmentHindi}</Text>
        </View>
        <View style={[styles.treatmentCard, styles.treatmentCardEn]}>
          <Text style={styles.treatmentTextEn}>{disease.treatment}</Text>
        </View>
      </View>

      {/* Listen Button */}
      <TouchableOpacity
        style={[styles.listenButton, isSpeaking && styles.listenButtonActive]}
        onPress={handleListenInfo}
      >
        {isSpeaking ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.listenButtonText}>रुकें...</Text>
          </>
        ) : (
          <>
            <Text style={styles.listenButtonIcon}>🔊</Text>
            <Text style={styles.listenButtonText}>जानकारी सुनें</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Tips Section */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.tipsTitle}>सुझाव</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>प्रभावित पौधों को तुरंत अलग करें</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>रोज पौधों की जांच करें</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>उचित दवाई का छिड़काव करें</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>विशेषज्ञ से सलाह लें</Text>
        </View>
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
    backgroundColor: '#FF9800',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 50,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  diseaseNameEn: {
    fontSize: 16,
    color: '#FFF3E0',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  lastSection: {
    marginBottom: 100,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  treatmentSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  treatmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  treatmentCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  treatmentCardEn: {
    backgroundColor: '#F5F5F5',
    borderLeftColor: '#9E9E9E',
  },
  treatmentIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  treatmentText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
  },
  treatmentTextEn: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  listenButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
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
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#757575',
  },
});

export default DiseaseDetailsScreen;
