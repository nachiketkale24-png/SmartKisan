import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, Crop, DiseaseRecord } from '../types';
import { getCropById } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'CropHealthDetail'>;

interface StoredDiseaseScan {
  id: string;
  cropId: string;
  diseaseName: string;
  diseaseNameHindi: string;
  detectedDate: string;
  status: 'Recovered' | 'Under Treatment' | 'Active';
  severity: 'Low' | 'Medium' | 'High';
  cause: string;
  solution: string;
  prevention: string;
  imageUri?: string;
}

const CropHealthDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { cropId } = route.params;

  const [crop, setCrop] = useState<Crop | null>(null);
  const [diseaseScans, setDiseaseScans] = useState<StoredDiseaseScan[]>([]);

  useEffect(() => {
    const cropData = getCropById(cropId);
    if (cropData) {
      setCrop(cropData);
    }
    loadDiseaseScans();
  }, [cropId]);

  const loadDiseaseScans = async () => {
    try {
      const stored = await AsyncStorage.getItem(`disease_scans_${cropId}`);
      if (stored) {
        setDiseaseScans(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading disease scans:', error);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
        return '#4CAF50';
      case 'Warning':
        return '#FF9800';
      case 'Critical':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'Good':
        return '✅';
      case 'Warning':
        return '⚠️';
      case 'Critical':
        return '🚨';
      default:
        return '❓';
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
        return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recovered':
        return '#4CAF50';
      case 'Under Treatment':
        return '#FF9800';
      case 'Active':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const handleAddScan = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to scan crops for diseases.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Choose Image Source',
      'Select how you want to add the crop image',
      [
        {
          text: 'Camera',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Gallery',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    let result;

    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      navigation.navigate('DiseaseScan', {
        cropId,
        cropName: crop?.name || '',
        imageUri: result.assets[0].uri,
      });
    }
  };

  const handleDiseaseCardPress = (scan: StoredDiseaseScan) => {
    navigation.navigate('DiseaseResult', {
      diseaseName: scan.diseaseName,
      diseaseNameHindi: scan.diseaseNameHindi,
      severity: scan.severity,
      cause: scan.cause,
      solution: scan.solution,
      prevention: scan.prevention,
      imageUri: scan.imageUri,
      cropName: crop?.name || '',
    });
  };

  const renderDiseaseHistoryCard = (record: DiseaseRecord, index: number) => (
    <React.Fragment key={record.id}>
      <TouchableOpacity
        style={styles.diseaseCard}
        onPress={() =>
          navigation.navigate('DiseaseResult', {
            diseaseName: record.diseaseName,
            diseaseNameHindi: record.diseaseNameHindi,
            severity: record.severity,
            cause: 'Environmental factors and crop stress conditions',
            solution: record.treatment,
            prevention: 'Regular monitoring and preventive care recommended',
            cropName: crop?.name || '',
          })
        }
        activeOpacity={0.7}
      >
      <View style={styles.diseaseImagePlaceholder}>
        <Text style={styles.diseaseImageIcon}>🦠</Text>
      </View>
      <View style={styles.diseaseInfo}>
        <Text style={styles.diseaseName}>{record.diseaseName}</Text>
        <Text style={styles.diseaseNameHindi}>{record.diseaseNameHindi}</Text>
        <Text style={styles.diseaseDate}>📅 {record.detectedDate}</Text>
        <View style={styles.diseaseStatusRow}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(record.severity) + '20' },
            ]}
          >
            <Text
              style={[
                styles.severityText,
                { color: getSeverityColor(record.severity) },
              ]}
            >
              {record.severity}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(record.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(record.status) },
              ]}
            >
              {record.status}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
    </React.Fragment>
  );

  const renderStoredScanCard = (scan: StoredDiseaseScan, index: number) => (
    <React.Fragment key={scan.id}>
      <TouchableOpacity
        style={styles.diseaseCard}
        onPress={() => handleDiseaseCardPress(scan)}
        activeOpacity={0.7}
      >
      {scan.imageUri ? (
        <Image source={{ uri: scan.imageUri }} style={styles.diseaseImage} />
      ) : (
        <View style={styles.diseaseImagePlaceholder}>
          <Text style={styles.diseaseImageIcon}>🦠</Text>
        </View>
      )}
      <View style={styles.diseaseInfo}>
        <Text style={styles.diseaseName}>{scan.diseaseName}</Text>
        <Text style={styles.diseaseNameHindi}>{scan.diseaseNameHindi}</Text>
        <Text style={styles.diseaseDate}>📅 {scan.detectedDate}</Text>
        <View style={styles.diseaseStatusRow}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(scan.severity) + '20' },
            ]}
          >
            <Text
              style={[
                styles.severityText,
                { color: getSeverityColor(scan.severity) },
              ]}
            >
              {scan.severity}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(scan.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(scan.status) },
              ]}
            >
              {scan.status}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
    </React.Fragment>
  );

  if (!crop) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const allDiseaseRecords = [
    ...crop.diseaseHistory,
    ...diseaseScans.map((scan) => ({
      ...scan,
      treatment: scan.solution,
      treatmentHindi: scan.solution,
      cropName: crop.name,
    })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Crop Info Section */}
        <View style={styles.cropInfoSection}>
          <View style={styles.cropHeader}>
            <View style={styles.cropIconLarge}>
              <Text style={styles.cropIconText}>🌾</Text>
            </View>
            <View style={styles.cropDetails}>
              <Text style={styles.cropName}>{crop.name}</Text>
              <Text style={styles.cropNameHindi}>{crop.nameHindi}</Text>
              <Text style={styles.fieldName}>
                📍 Field {crop.id} • {crop.area} {crop.areaUnit}
              </Text>
            </View>
          </View>

          {/* Health Status */}
          <View
            style={[
              styles.healthStatusCard,
              { backgroundColor: getHealthStatusColor(crop.healthStatus) + '15' },
            ]}
          >
            <Text style={styles.healthStatusIcon}>
              {getHealthStatusIcon(crop.healthStatus)}
            </Text>
            <View style={styles.healthStatusInfo}>
              <Text style={styles.healthStatusLabel}>Current Health Status</Text>
              <Text
                style={[
                  styles.healthStatusValue,
                  { color: getHealthStatusColor(crop.healthStatus) },
                ]}
              >
                {crop.healthStatus}
              </Text>
            </View>
          </View>

          {/* Growth Stage */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🌱</Text>
              <Text style={styles.infoLabel}>Growth Stage</Text>
              <Text style={styles.infoValue}>{crop.growthStage}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💧</Text>
              <Text style={styles.infoLabel}>Last Irrigation</Text>
              <Text style={styles.infoValue}>{crop.lastIrrigationDate}</Text>
            </View>
          </View>
        </View>

        {/* Disease Records Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔬 Disease Records</Text>
            <Text style={styles.sectionTitleHindi}>रोग रिकॉर्ड</Text>
          </View>

          {allDiseaseRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyText}>No disease records found</Text>
              <Text style={styles.emptyTextHindi}>
                कोई रोग रिकॉर्ड नहीं मिला
              </Text>
            </View>
          ) : (
            <>
              {crop.diseaseHistory.map((record, index) =>
                renderDiseaseHistoryCard(record, index)
              )}
              {diseaseScans.map((scan, index) =>
                renderStoredScanCard(scan, index)
              )}
            </>
          )}
        </View>

        {/* Add Scan Button */}
        <TouchableOpacity
          style={styles.addScanButton}
          onPress={handleAddScan}
          activeOpacity={0.8}
        >
          <Text style={styles.addScanIcon}>➕</Text>
          <View style={styles.addScanTextContainer}>
            <Text style={styles.addScanText}>Add New Infection Scan</Text>
            <Text style={styles.addScanTextHindi}>
              नया संक्रमण स्कैन जोड़ें
            </Text>
          </View>
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  cropInfoSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cropIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cropIconText: {
    fontSize: 36,
  },
  cropDetails: {
    flex: 1,
  },
  cropName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cropNameHindi: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  fieldName: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
  },
  healthStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  healthStatusIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  healthStatusInfo: {
    flex: 1,
  },
  healthStatusLabel: {
    fontSize: 14,
    color: '#666',
  },
  healthStatusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitleHindi: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTextHindi: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  diseaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  diseaseImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
  },
  diseaseImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  diseaseImageIcon: {
    fontSize: 28,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  diseaseNameHindi: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  diseaseDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  diseaseStatusRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardArrow: {
    fontSize: 28,
    color: '#BDBDBD',
    marginLeft: 8,
  },
  addScanButton: {
    backgroundColor: '#2E7D32',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addScanIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  addScanTextContainer: {
    flex: 1,
  },
  addScanText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addScanTextHindi: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 2,
  },
  cameraIcon: {
    fontSize: 32,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default CropHealthDetailScreen;
