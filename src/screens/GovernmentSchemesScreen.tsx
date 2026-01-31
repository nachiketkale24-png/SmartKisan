import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types';
import { 
  getSchemes, 
  Scheme, 
  getDaysRemaining,
  formatDate,
} from '../services/schemeService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GovernmentSchemesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    const data = await getSchemes();
    setSchemes(data.schemes);
    setLastUpdated(data.lastUpdated);
    setIsOffline(data.isOffline);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchemes();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return '#4CAF50';
      case 'Closing Soon':
        return '#FF9800';
      case 'Closed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusHindi = (status: string) => {
    switch (status) {
      case 'Open':
        return 'खुला है';
      case 'Closing Soon':
        return 'जल्द बंद';
      case 'Closed':
        return 'बंद है';
      default:
        return status;
    }
  };

  const speakSchemesSummary = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const openSchemes = schemes.filter(s => s.status === 'Open' || s.status === 'Closing Soon');
    let summary = `आज ${openSchemes.length} सरकारी योजनाएं उपलब्ध हैं। `;
    
    openSchemes.slice(0, 3).forEach(scheme => {
      summary += `${scheme.nameHindi}, लाभ ${scheme.benefit}। `;
    });
    
    summary += `अधिक जानकारी के लिए किसी योजना पर टैप करें।`;

    setIsSpeaking(true);
    await Speech.speak(summary, {
      language: 'hi-IN',
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const renderSchemeCard = ({ item }: { item: Scheme }) => {
    const daysRemaining = getDaysRemaining(item.deadline);
    
    return (
      <TouchableOpacity
        style={styles.schemeCard}
        onPress={() => navigation.navigate('SchemeDetail', { schemeId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.schemeIconContainer}>
            <Text style={styles.schemeIcon}>🏛️</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusHindi(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.schemeName}>{item.name}</Text>
        <Text style={styles.schemeNameHindi}>{item.nameHindi}</Text>

        <View style={styles.benefitRow}>
          <Text style={styles.benefitIcon}>💰</Text>
          <Text style={styles.benefitText}>{item.benefit}</Text>
        </View>

        <View style={styles.deadlineRow}>
          <Text style={styles.deadlineIcon}>📅</Text>
          <Text style={styles.deadlineText}>
            Last Date: {formatDate(item.deadline)}
          </Text>
        </View>

        {daysRemaining > 0 && daysRemaining <= 30 && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>
              ⏰ {daysRemaining} days left / {daysRemaining} दिन बाकी
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.applyMethodText}>📝 {item.applyMethod}</Text>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineIcon}>📴</Text>
          <Text style={styles.offlineText}>
            Offline Mode / ऑफ़लाइन मोड
          </Text>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Text style={styles.infoIcon}>🏛️</Text>
        </View>
        <Text style={styles.infoTitle}>सरकारी योजनाएं</Text>
        <Text style={styles.infoSubtitle}>Government Schemes for Farmers</Text>
        <Text style={styles.infoDescription}>
          किसानों के लिए विभिन्न सरकारी योजनाओं की जानकारी
        </Text>

        {/* Voice Button */}
        <TouchableOpacity
          style={[styles.voiceButton, isSpeaking && styles.voiceButtonActive]}
          onPress={speakSchemesSummary}
        >
          <Text style={styles.voiceButtonIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
          <Text style={styles.voiceButtonText}>
            {isSpeaking ? 'Stop' : 'सुनें / Listen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {schemes.filter(s => s.status === 'Open').length}
          </Text>
          <Text style={styles.statLabel}>Open / खुली</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>
            {schemes.filter(s => s.status === 'Closing Soon').length}
          </Text>
          <Text style={styles.statLabel}>Closing Soon</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#9E9E9E' }]}>
            {schemes.length}
          </Text>
          <Text style={styles.statLabel}>Total / कुल</Text>
        </View>
      </View>

      {/* Last Updated */}
      <Text style={styles.lastUpdated}>
        🕐 Last updated: {new Date(lastUpdated).toLocaleString('en-IN')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏛️ Government Schemes</Text>
        <Text style={styles.headerTitleHindi}>सरकारी योजनाएं</Text>
      </View>

      {/* Content */}
      <FlatList
        data={schemes}
        renderItem={renderSchemeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    backgroundColor: '#1565C0',
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
    color: '#BBDEFB',
    textAlign: 'center',
    marginTop: 4,
  },
  headerContent: {
    paddingBottom: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  offlineIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  infoCard: {
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
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 30,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  voiceButtonActive: {
    backgroundColor: '#1565C0',
  },
  voiceButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  lastUpdated: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  schemeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schemeIcon: {
    fontSize: 22,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  schemeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  schemeNameHindi: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  deadlineIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  deadlineText: {
    fontSize: 14,
    color: '#666',
  },
  urgentBadge: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  urgentText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyMethodText: {
    fontSize: 13,
    color: '#888',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#BDBDBD',
  },
});

export default GovernmentSchemesScreen;
