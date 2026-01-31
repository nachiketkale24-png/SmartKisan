import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Crop, FarmTask, DiseaseRecord } from '../types';
import {
  mockCrops,
  getPriorityIrrigation,
  getPendingTasks,
  mockDiseases,
} from '../data/mockData';
import { t } from '../i18n/translations';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const priorityIrrigation = getPriorityIrrigation();
  const pendingTasks = getPendingTasks();
  const recentDiseases = mockDiseases.filter(d => d.status !== 'Recovered').slice(0, 3);

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

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'irrigation':
        return '💧';
      case 'fertilizer':
        return '🌱';
      case 'disease':
        return '🔍';
      case 'harvest':
        return '🌾';
      default:
        return '📋';
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

  const renderCropCard = (crop: Crop) => (
    <TouchableOpacity
      key={crop.id}
      style={styles.cropCard}
      onPress={() => navigation.navigate('CropDetails', { cropId: crop.id })}
    >
      <View style={styles.cropHeader}>
        <Text style={styles.cropEmoji}>🌾</Text>
        <View style={styles.cropInfo}>
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
      <View style={styles.cropDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('area', 'hi')}</Text>
          <Text style={styles.detailValue}>
            {crop.area} {crop.areaUnit === 'acre' ? t('acre', 'hi') : t('hectare', 'hi')}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('stage', 'hi')}</Text>
          <Text style={styles.detailValue}>{crop.growthStage}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('planted', 'hi')}</Text>
          <Text style={styles.detailValue}>{crop.plantationDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPriorityIrrigation = () => {
    if (!priorityIrrigation) return null;

    return (
      <TouchableOpacity
        style={styles.priorityCard}
        onPress={() =>
          navigation.navigate('IrrigationRecommendation', {
            cropId: priorityIrrigation.cropId,
          })
        }
      >
        <View style={styles.priorityHeader}>
          <Text style={styles.priorityTitle}>{t('priorityIrrigation', 'hi')}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: '#F44336' }]}>
            <Text style={styles.priorityBadgeText}>{t('high', 'hi')}</Text>
          </View>
        </View>
        <View style={styles.priorityContent}>
          <Text style={styles.priorityCrop}>
            💧 {priorityIrrigation.cropNameHindi} ({priorityIrrigation.cropName})
          </Text>
          <Text style={styles.priorityWater}>
            {priorityIrrigation.recommendedWater} {t('liters', 'hi')}
          </Text>
          <Text style={styles.priorityReason}>{priorityIrrigation.reasonHindi}</Text>
        </View>
        <Text style={styles.tapToView}>टैप करें विवरण देखने के लिए →</Text>
      </TouchableOpacity>
    );
  };

  const renderTask = (task: FarmTask) => (
    <View
      key={task.id}
      style={[styles.taskCard, task.completed && styles.taskCompleted]}
    >
      <Text style={styles.taskIcon}>{getTaskIcon(task.type)}</Text>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.titleHindi}
        </Text>
        <Text style={styles.taskCrop}>{task.cropName}</Text>
        {task.dueTime && <Text style={styles.taskTime}>⏰ {task.dueTime}</Text>}
      </View>
      <View
        style={[
          styles.taskPriority,
          { backgroundColor: getPriorityColor(task.priority) },
        ]}
      >
        <Text style={styles.taskPriorityText}>{task.priority}</Text>
      </View>
    </View>
  );

  const renderDiseaseItem = (disease: DiseaseRecord) => (
    <TouchableOpacity
      key={disease.id}
      style={styles.diseaseCard}
      onPress={() => navigation.navigate('DiseaseDetails', { diseaseId: disease.id })}
    >
      <Text style={styles.diseaseIcon}>⚠️</Text>
      <View style={styles.diseaseContent}>
        <Text style={styles.diseaseName}>{disease.diseaseNameHindi}</Text>
        <Text style={styles.diseaseCrop}>{disease.cropName}</Text>
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
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 AgriGuard</Text>
        <Text style={styles.headerSubtitle}>{t('dashboard', 'hi')}</Text>
      </View>

      {/* Priority Irrigation */}
      {renderPriorityIrrigation()}

      {/* My Crops Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('myCrops', 'hi')}</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>{t('viewAll', 'hi')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cropsContainer}
        >
          {mockCrops.map(renderCropCard)}
        </ScrollView>
      </View>

      {/* Today's Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('todaysTasks', 'hi')}</Text>
          <Text style={styles.taskCount}>
            {pendingTasks.length} {t('pending', 'hi')}
          </Text>
        </View>
        <View style={styles.tasksList}>
          {pendingTasks.slice(0, 4).map(renderTask)}
        </View>
      </View>

      {/* Disease History */}
      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('previousIssues', 'hi')}</Text>
        </View>
        <View style={styles.diseaseList}>
          {recentDiseases.length > 0 ? (
            recentDiseases.map(renderDiseaseItem)
          ) : (
            <Text style={styles.noData}>{t('noData', 'hi')}</Text>
          )}
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
    backgroundColor: '#2E7D32',
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
    fontSize: 16,
    color: '#C8E6C9',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  lastSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  taskCount: {
    fontSize: 14,
    color: '#757575',
  },
  cropsContainer: {
    paddingRight: 16,
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: width * 0.7,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cropNameEn: {
    fontSize: 14,
    color: '#757575',
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  healthText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cropDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  priorityCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priorityContent: {
    marginBottom: 8,
  },
  priorityCrop: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priorityWater: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  priorityReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tapToView: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'right',
    marginTop: 8,
  },
  tasksList: {
    gap: 8,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskCompleted: {
    opacity: 0.6,
    backgroundColor: '#E8F5E9',
  },
  taskIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  taskCrop: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  taskTime: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
  },
  taskPriority: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskPriorityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  diseaseList: {
    gap: 8,
  },
  diseaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  diseaseIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  diseaseContent: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  diseaseCrop: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  diseaseDate: {
    fontSize: 12,
    color: '#9E9E9E',
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
  noData: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 14,
    padding: 20,
  },
});

export default DashboardScreen;
