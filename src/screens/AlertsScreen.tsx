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
import { mockDiseases, mockCrops } from '../data/mockData';
import { t } from '../i18n/translations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AlertsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const criticalCrops = mockCrops.filter(c => c.healthStatus === 'Critical');
  const warningCrops = mockCrops.filter(c => c.healthStatus === 'Warning');
  const activeDiseases = mockDiseases.filter(d => d.status !== 'Recovered');

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 {t('alerts', 'hi')}</Text>
        <Text style={styles.headerSubtitle}>Alerts & Notifications</Text>
      </View>

      {/* Critical Alerts */}
      {criticalCrops.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚨 गंभीर अलर्ट</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{criticalCrops.length}</Text>
            </View>
          </View>
          {criticalCrops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.alertCard, styles.criticalCard]}
              onPress={() => navigation.navigate('CropDetails', { cropId: crop.id })}
            >
              <Text style={styles.alertIcon}>🚨</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{crop.nameHindi} - गंभीर स्थिति</Text>
                <Text style={styles.alertDesc}>
                  फसल की स्थिति गंभीर है। तुरंत जांच करें।
                </Text>
              </View>
              <Text style={styles.alertArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Warning Alerts */}
      {warningCrops.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ चेतावनी</Text>
            <View style={[styles.countBadge, styles.warningBadge]}>
              <Text style={styles.countText}>{warningCrops.length}</Text>
            </View>
          </View>
          {warningCrops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[styles.alertCard, styles.warningCard]}
              onPress={() => navigation.navigate('CropDetails', { cropId: crop.id })}
            >
              <Text style={styles.alertIcon}>⚠️</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{crop.nameHindi} - ध्यान दें</Text>
                <Text style={styles.alertDesc}>
                  फसल को अतिरिक्त देखभाल की जरूरत है।
                </Text>
              </View>
              <Text style={styles.alertArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Disease Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🦠 रोग अलर्ट</Text>
          <View style={[styles.countBadge, styles.diseaseBadge]}>
            <Text style={styles.countText}>{activeDiseases.length}</Text>
          </View>
        </View>
        {activeDiseases.length > 0 ? (
          activeDiseases.map((disease) => (
            <TouchableOpacity
              key={disease.id}
              style={styles.diseaseCard}
              onPress={() => navigation.navigate('DiseaseDetails', { diseaseId: disease.id })}
            >
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseIcon}>🦠</Text>
                <View style={styles.diseaseInfo}>
                  <Text style={styles.diseaseName}>{disease.diseaseNameHindi}</Text>
                  <Text style={styles.diseaseCrop}>{disease.cropName}</Text>
                </View>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(disease.severity) },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {disease.severity === 'Low'
                      ? t('low', 'hi')
                      : disease.severity === 'Medium'
                      ? t('medium', 'hi')
                      : t('high', 'hi')}
                  </Text>
                </View>
              </View>
              <Text style={styles.diseaseStatus}>
                स्थिति:{' '}
                {disease.status === 'Active'
                  ? t('active', 'hi')
                  : t('underTreatment', 'hi')}
              </Text>
              <Text style={styles.diseaseDate}>
                पता चला: {disease.detectedDate}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noAlerts}>
            <Text style={styles.noAlertsIcon}>✅</Text>
            <Text style={styles.noAlertsText}>कोई सक्रिय रोग नहीं</Text>
          </View>
        )}
      </View>

      {/* Weather Alert (Demo) */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>🌤️ मौसम अलर्ट</Text>
        <View style={styles.weatherCard}>
          <Text style={styles.weatherIcon}>☀️</Text>
          <View style={styles.weatherContent}>
            <Text style={styles.weatherTitle}>आज का मौसम साफ</Text>
            <Text style={styles.weatherDesc}>
              तापमान: 28-32°C | आर्द्रता: 55%
            </Text>
            <Text style={styles.weatherAdvice}>
              सिंचाई के लिए सुबह 6-8 बजे का समय उपयुक्त है
            </Text>
          </View>
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
    backgroundColor: '#F44336',
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
    color: '#FFCDD2',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  lastSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningBadge: {
    backgroundColor: '#FF9800',
  },
  diseaseBadge: {
    backgroundColor: '#9C27B0',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertCard: {
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
    borderLeftWidth: 4,
  },
  criticalCard: {
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  warningCard: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  alertIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alertDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  alertArrow: {
    fontSize: 20,
    color: '#757575',
  },
  diseaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  diseaseIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  diseaseCrop: {
    fontSize: 13,
    color: '#757575',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  diseaseStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  diseaseDate: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  noAlerts: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  noAlertsIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  weatherCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  weatherContent: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  weatherAdvice: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
});

export default AlertsScreen;
