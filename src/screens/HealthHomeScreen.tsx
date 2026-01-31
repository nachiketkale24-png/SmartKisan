import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Crop } from '../types';
import { mockCrops } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HealthHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [crops, setCrops] = useState<Crop[]>([]);

  useEffect(() => {
    // Load crops from mock data (can be replaced with API call)
    setCrops(mockCrops);
  }, []);

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

  const getHealthStatusHindi = (status: string) => {
    switch (status) {
      case 'Good':
        return 'अच्छा';
      case 'Warning':
        return 'चेतावनी';
      case 'Critical':
        return 'गंभीर';
      default:
        return 'अज्ञात';
    }
  };

  const renderCropCard = ({ item }: { item: Crop }) => (
    <TouchableOpacity
      style={styles.cropCard}
      onPress={() => navigation.navigate('CropHealthDetail', { cropId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cropIconContainer}>
        <Text style={styles.cropIcon}>🌾</Text>
      </View>
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{item.name}</Text>
        <Text style={styles.cropNameHindi}>{item.nameHindi}</Text>
        <Text style={styles.fieldInfo}>
          📍 Field {item.id} • {item.area} {item.areaUnit}
        </Text>
        <Text style={styles.diseaseCount}>
          🔍 {item.diseaseHistory.length} disease record(s)
        </Text>
      </View>
      <View style={styles.healthStatusContainer}>
        <View
          style={[
            styles.healthBadge,
            { backgroundColor: getHealthStatusColor(item.healthStatus) + '20' },
          ]}
        >
          <Text style={styles.healthIcon}>
            {getHealthStatusIcon(item.healthStatus)}
          </Text>
          <Text
            style={[
              styles.healthText,
              { color: getHealthStatusColor(item.healthStatus) },
            ]}
          >
            {getHealthStatusHindi(item.healthStatus)}
          </Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.headerIcon}>
        <Text style={styles.headerIconText}>🏥</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        अपनी फसलों की स्वास्थ्य स्थिति जांचें
      </Text>
      <Text style={styles.headerSubtitleEn}>
        Check health status of your crops
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{crops.length}</Text>
          <Text style={styles.statLabel}>कुल फसलें</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {crops.filter((c) => c.healthStatus === 'Good').length}
          </Text>
          <Text style={styles.statLabel}>स्वस्थ</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>
            {crops.filter((c) => c.healthStatus !== 'Good').length}
          </Text>
          <Text style={styles.statLabel}>ध्यान दें</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Crop Health Monitor</Text>
        <Text style={styles.headerTitleHindi}>फसल स्वास्थ्य निगरानी</Text>
      </View>

      {/* Content */}
      <FlatList
        data={crops}
        renderItem={renderCropCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerTitleHindi: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 4,
  },
  headerContent: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconText: {
    fontSize: 30,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerSubtitleEn: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  listContent: {
    paddingBottom: 100,
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cropIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cropIcon: {
    fontSize: 28,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cropNameHindi: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  fieldInfo: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  diseaseCount: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 4,
    fontWeight: '500',
  },
  healthStatusContainer: {
    alignItems: 'center',
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  healthIcon: {
    fontSize: 20,
  },
  healthText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#BDBDBD',
    marginTop: 8,
  },
});

export default HealthHomeScreen;
