import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, IrrigationRecommendation, ManualSensorInput } from '../types';
import { getCropById, mockIrrigationRecommendations } from '../data/mockData';
import { t } from '../i18n/translations';
import voiceService from '../services/voiceService';
import apiService from '../services/apiService';

type IrrigationRouteProp = RouteProp<RootStackParamList, 'IrrigationRecommendation'>;

const IrrigationRecommendationScreen: React.FC = () => {
  const route = useRoute<IrrigationRouteProp>();
  const cropId = route.params?.cropId;
  const crop = cropId ? getCropById(cropId) : null;

  const [mode, setMode] = useState<'select' | 'manual' | 'sensor' | 'result'>('select');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);

  // Manual input state
  const [manualInput, setManualInput] = useState<ManualSensorInput>({
    temperature: 30,
    soilMoisture: 40,
    soilType: 'Loamy',
    cropStage: 'Vegetative',
  });

  useEffect(() => {
    // If we have a cropId, check for existing recommendation
    if (cropId) {
      const existingRec = mockIrrigationRecommendations.find(r => r.cropId === cropId);
      if (existingRec) {
        setRecommendation(existingRec);
        setMode('result');
      }
    }
  }, [cropId]);

  const handleUseSensorData = async () => {
    if (!cropId) return;
    
    setLoading(true);
    try {
      const sensorData = await apiService.fetchSensorData(cropId);
      if (sensorData) {
        const rec = await apiService.getIrrigationRecommendation(cropId);
        if (rec) {
          setRecommendation(rec);
          setMode('result');
        }
      }
    } catch (error) {
      console.log('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateManual = async () => {
    setLoading(true);
    try {
      const rec = await apiService.getIrrigationRecommendation(
        cropId || '1',
        manualInput
      );
      if (rec) {
        setRecommendation(rec);
        setMode('result');
      }
    } catch (error) {
      console.log('Error calculating recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListenRecommendation = async () => {
    if (!recommendation) return;

    if (isSpeaking) {
      await voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await voiceService.speakIrrigationRecommendation(
        recommendation.cropNameHindi,
        recommendation.recommendedWater,
        recommendation.reasonHindi,
        recommendation.waterSaving,
        true
      );
    } catch (error) {
      console.log('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

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

  const renderSelectMode = () => (
    <View style={styles.selectContainer}>
      <Text style={styles.selectTitle}>सिंचाई सलाह कैसे प्राप्त करें?</Text>
      <Text style={styles.selectSubtitle}>Choose how to get irrigation recommendation</Text>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => setMode('manual')}
      >
        <Text style={styles.optionIcon}>✏️</Text>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{t('enterManually', 'hi')}</Text>
          <Text style={styles.optionDesc}>तापमान, नमी और मिट्टी का डेटा दर्ज करें</Text>
        </View>
        <Text style={styles.optionArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionCard, !crop?.sensorData && styles.optionDisabled]}
        onPress={handleUseSensorData}
        disabled={!crop?.sensorData}
      >
        <Text style={styles.optionIcon}>📡</Text>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{t('useSensor', 'hi')}</Text>
          <Text style={styles.optionDesc}>
            {crop?.sensorData
              ? 'सेंसर से स्वचालित डेटा प्राप्त करें'
              : 'सेंसर डेटा उपलब्ध नहीं है'}
          </Text>
        </View>
        <Text style={styles.optionArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );

  const renderManualInput = () => (
    <ScrollView style={styles.manualContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.manualTitle}>मैन्युअल डेटा दर्ज करें</Text>

      {/* Temperature */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('temperature', 'hi')}</Text>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() =>
              setManualInput(prev => ({ ...prev, temperature: prev.temperature - 1 }))
            }
          >
            <Text style={styles.inputButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.inputValue}>{manualInput.temperature}°C</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() =>
              setManualInput(prev => ({ ...prev, temperature: prev.temperature + 1 }))
            }
          >
            <Text style={styles.inputButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Soil Moisture */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('soilMoisture', 'hi')}</Text>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() =>
              setManualInput(prev => ({
                ...prev,
                soilMoisture: Math.max(0, prev.soilMoisture - 5),
              }))
            }
          >
            <Text style={styles.inputButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.inputValue}>{manualInput.soilMoisture}%</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() =>
              setManualInput(prev => ({
                ...prev,
                soilMoisture: Math.min(100, prev.soilMoisture + 5),
              }))
            }
          >
            <Text style={styles.inputButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Soil Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('soilType', 'hi')}</Text>
        <View style={styles.optionsRow}>
          {(['Clay', 'Sandy', 'Loamy', 'Silty'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionPill,
                manualInput.soilType === type && styles.optionPillActive,
              ]}
              onPress={() => setManualInput(prev => ({ ...prev, soilType: type }))}
            >
              <Text
                style={[
                  styles.optionPillText,
                  manualInput.soilType === type && styles.optionPillTextActive,
                ]}
              >
                {type === 'Clay'
                  ? t('clay', 'hi')
                  : type === 'Sandy'
                  ? t('sandy', 'hi')
                  : type === 'Loamy'
                  ? t('loamy', 'hi')
                  : t('silty', 'hi')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Crop Stage */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('cropStage', 'hi')}</Text>
        <View style={styles.optionsRow}>
          {(['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'] as const).map(
            stage => (
              <TouchableOpacity
                key={stage}
                style={[
                  styles.optionPill,
                  manualInput.cropStage === stage && styles.optionPillActive,
                ]}
                onPress={() => setManualInput(prev => ({ ...prev, cropStage: stage }))}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    manualInput.cropStage === stage && styles.optionPillTextActive,
                  ]}
                >
                  {stage === 'Seedling'
                    ? t('seedling', 'hi')
                    : stage === 'Vegetative'
                    ? t('vegetative', 'hi')
                    : stage === 'Flowering'
                    ? t('flowering', 'hi')
                    : stage === 'Fruiting'
                    ? t('fruiting', 'hi')
                    : t('harvest', 'hi')}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Calculate Button */}
      <TouchableOpacity
        style={styles.calculateButton}
        onPress={handleCalculateManual}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.calculateButtonText}>{t('calculate', 'hi')}</Text>
        )}
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setMode('select')}
      >
        <Text style={styles.backButtonText}>← वापस जाएं</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderResult = () => {
    if (!recommendation) return null;

    return (
      <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultCrop}>
            💧 {recommendation.cropNameHindi}
          </Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(recommendation.priority) },
            ]}
          >
            <Text style={styles.priorityText}>
              {recommendation.priority === 'High'
                ? t('high', 'hi')
                : recommendation.priority === 'Medium'
                ? t('medium', 'hi')
                : t('low', 'hi')}{' '}
              प्राथमिकता
            </Text>
          </View>
        </View>

        {/* Water Amount */}
        <View style={styles.waterCard}>
          <Text style={styles.waterIcon}>💧</Text>
          <Text style={styles.waterAmount}>{recommendation.recommendedWater}</Text>
          <Text style={styles.waterUnit}>{t('liters', 'hi')}</Text>
          <Text style={styles.waterLabel}>{t('recommendedWater', 'hi')}</Text>
        </View>

        {/* Reason */}
        <View style={styles.reasonCard}>
          <Text style={styles.reasonTitle}>{t('reason', 'hi')}:</Text>
          <Text style={styles.reasonText}>{recommendation.reasonHindi}</Text>
        </View>

        {/* Water Saving */}
        <View style={styles.savingCard}>
          <Text style={styles.savingIcon}>💰</Text>
          <View style={styles.savingContent}>
            <Text style={styles.savingTitle}>{t('waterSaving', 'hi')}</Text>
            <Text style={styles.savingValue}>{recommendation.waterSaving}%</Text>
            <Text style={styles.savingDesc}>
              इस सलाह का पालन करने से पानी की बचत होगी
            </Text>
          </View>
        </View>

        {/* Listen Button */}
        <TouchableOpacity
          style={[styles.listenButton, isSpeaking && styles.listenButtonActive]}
          onPress={handleListenRecommendation}
        >
          {isSpeaking ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.listenButtonText}>रुकें...</Text>
            </>
          ) : (
            <>
              <Text style={styles.listenButtonIcon}>🔊</Text>
              <Text style={styles.listenButtonText}>
                {t('listenRecommendation', 'hi')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* New Calculation Button */}
        <TouchableOpacity
          style={styles.newCalcButton}
          onPress={() => {
            setRecommendation(null);
            setMode('select');
          }}
        >
          <Text style={styles.newCalcButtonText}>नई सलाह प्राप्त करें</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('irrigationRecommendation', 'hi')}</Text>
        {crop && (
          <Text style={styles.headerSubtitle}>
            {crop.nameHindi} ({crop.name})
          </Text>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>गणना हो रही है...</Text>
        </View>
      )}

      {/* Content based on mode */}
      {!loading && mode === 'select' && renderSelectMode()}
      {!loading && mode === 'manual' && renderManualInput()}
      {!loading && mode === 'result' && renderResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#BBDEFB',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  selectContainer: {
    flex: 1,
    padding: 20,
  },
  selectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  selectSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionDesc: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  optionArrow: {
    fontSize: 24,
    color: '#2E7D32',
  },
  manualContainer: {
    flex: 1,
    padding: 20,
  },
  manualTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  inputButton: {
    width: 50,
    height: 50,
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputButtonText: {
    fontSize: 28,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  inputValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 100,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionPillActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  optionPillText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  optionPillTextActive: {
    color: '#FFFFFF',
  },
  calculateButton: {
    backgroundColor: '#2E7D32',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  backButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultCrop: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  priorityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  waterCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  waterIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  waterAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  waterUnit: {
    fontSize: 20,
    color: '#1976D2',
    marginTop: 4,
  },
  waterLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  savingCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  savingIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  savingContent: {
    flex: 1,
  },
  savingTitle: {
    fontSize: 14,
    color: '#666',
  },
  savingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  savingDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  listenButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
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
  newCalcButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  newCalcButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IrrigationRecommendationScreen;
