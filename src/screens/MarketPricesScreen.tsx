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
  Modal,
} from 'react-native';
import * as Speech from 'expo-speech';
import {
  getMandiPrices,
  getCropPrices,
  getBestMandi,
  getAvailableCrops,
  getPriceSummaryForVoice,
  formatLastUpdated,
  getTrendIcon,
  getTrendColor,
  CropPrices,
  MandiPrice,
  BestMandiRecommendation,
} from '../services/mandiService';

const MarketPricesScreen: React.FC = () => {
  const [allPrices, setAllPrices] = useState<CropPrices[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [cropPrices, setCropPrices] = useState<CropPrices | null>(null);
  const [bestMandi, setBestMandi] = useState<BestMandiRecommendation | null>(null);
  const [availableCrops, setAvailableCrops] = useState<{ crop: string; cropHindi: string }[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCropPicker, setShowCropPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCropPrices();
  }, [selectedCrop, allPrices]);

  const loadData = async () => {
    const data = await getMandiPrices();
    setAllPrices(data.prices);
    setLastUpdated(data.lastUpdated);
    setIsOffline(data.isOffline);
    
    const crops = await getAvailableCrops();
    setAvailableCrops(crops);
  };

  const loadCropPrices = async () => {
    const prices = await getCropPrices(selectedCrop);
    setCropPrices(prices);
    if (prices) {
      setBestMandi(getBestMandi(prices));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const speakPrices = async () => {
    if (!cropPrices) return;
    
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const summary = getPriceSummaryForVoice(cropPrices, 'hi');
    setIsSpeaking(true);
    
    await Speech.speak(summary, {
      language: 'hi-IN',
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const getSelectedCropHindi = () => {
    const crop = availableCrops.find(c => c.crop === selectedCrop);
    return crop?.cropHindi || selectedCrop;
  };

  const renderMandiCard = ({ item, index }: { item: MandiPrice; index: number }) => {
    const isBest = bestMandi?.mandi.name === item.name;
    
    return (
      <View style={[styles.mandiCard, isBest && styles.bestMandiCard]}>
        {isBest && (
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>🏆 Best Price</Text>
          </View>
        )}
        
        <View style={styles.mandiHeader}>
          <View style={styles.mandiNameContainer}>
            <Text style={styles.mandiName}>{item.name}</Text>
            <Text style={styles.mandiNameHindi}>{item.nameHindi}</Text>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: getTrendColor(item.trend) + '20' }]}>
            <Text style={styles.trendIcon}>{getTrendIcon(item.trend)}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price / भाव</Text>
            <Text style={[styles.priceValue, isBest && styles.bestPriceValue]}>
              ₹{item.price}
            </Text>
            <Text style={styles.priceUnit}>per quintal / प्रति क्विंटल</Text>
          </View>
          
          <View style={styles.changeContainer}>
            <Text style={styles.changeLabel}>Change / बदलाव</Text>
            <Text style={[
              styles.changeValue,
              { color: getTrendColor(item.trend) }
            ]}>
              {item.change > 0 ? '+' : ''}{item.change}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    const updatedText = formatLastUpdated(lastUpdated);
    
    return (
      <View style={styles.headerContent}>
        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineIcon}>📴</Text>
            <Text style={styles.offlineText}>
              Offline Mode - Showing cached prices
            </Text>
          </View>
        )}

        {/* Crop Selector */}
        <View style={styles.selectorCard}>
          <Text style={styles.selectorLabel}>Select Crop / फसल चुनें</Text>
          <TouchableOpacity
            style={styles.cropSelector}
            onPress={() => setShowCropPicker(true)}
          >
            <Text style={styles.cropSelectorIcon}>🌾</Text>
            <View style={styles.cropSelectorText}>
              <Text style={styles.selectedCropName}>{selectedCrop}</Text>
              <Text style={styles.selectedCropNameHindi}>{getSelectedCropHindi()}</Text>
            </View>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Best Mandi Recommendation */}
        {bestMandi && (
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <Text style={styles.recommendationTitle}>Smart Recommendation</Text>
            </View>
            <Text style={styles.recommendationText}>{bestMandi.message}</Text>
            <Text style={styles.recommendationTextHindi}>{bestMandi.messageHindi}</Text>
          </View>
        )}

        {/* Voice Button */}
        <TouchableOpacity
          style={[styles.voiceButton, isSpeaking && styles.voiceButtonActive]}
          onPress={speakPrices}
        >
          <Text style={styles.voiceButtonIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
          <View style={styles.voiceButtonTextContainer}>
            <Text style={styles.voiceButtonText}>
              {isSpeaking ? 'Stop' : "Listen Today's Prices"}
            </Text>
            <Text style={styles.voiceButtonTextHindi}>
              {isSpeaking ? 'रोकें' : 'आज के भाव सुनें'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          🕐 {updatedText.en}
        </Text>

        {/* Section Title */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>
            📊 {selectedCrop} Prices at Various Mandis
          </Text>
          <Text style={styles.sectionTitleHindi}>
            विभिन्न मंडियों में {getSelectedCropHindi()} के भाव
          </Text>
        </View>
      </View>
    );
  };

  const renderCropPickerModal = () => (
    <Modal
      visible={showCropPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCropPicker(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCropPicker(false)}
      >
        <View style={styles.cropPickerContainer}>
          <View style={styles.cropPickerHeader}>
            <Text style={styles.cropPickerTitle}>Select Crop / फसल चुनें</Text>
            <TouchableOpacity onPress={() => setShowCropPicker(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {availableCrops.map((crop) => (
            <React.Fragment key={crop.crop}>
              <TouchableOpacity
                style={[
                  styles.cropPickerItem,
                  selectedCrop === crop.crop && styles.cropPickerItemSelected
                ]}
                onPress={() => {
                  setSelectedCrop(crop.crop);
                  setShowCropPicker(false);
                }}
              >
                <Text style={styles.cropPickerItemIcon}>🌾</Text>
                <View style={styles.cropPickerItemText}>
                  <Text style={[
                    styles.cropPickerItemName,
                    selectedCrop === crop.crop && styles.cropPickerItemNameSelected
                  ]}>
                    {crop.crop}
                  </Text>
                  <Text style={styles.cropPickerItemNameHindi}>{crop.cropHindi}</Text>
                </View>
                {selectedCrop === crop.crop && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E65100" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏪 Sabzi Mandi Prices</Text>
        <Text style={styles.headerTitleHindi}>सब्जी मंडी भाव</Text>
      </View>

      {/* Content */}
      <FlatList
        data={cropPrices?.mandis || []}
        renderItem={renderMandiCard}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Crop Picker Modal */}
      {renderCropPickerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#E65100',
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
    color: '#FFCCBC',
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
  selectorCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  cropSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 14,
    borderRadius: 12,
  },
  cropSelectorIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  cropSelectorText: {
    flex: 1,
  },
  selectedCropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedCropNameHindi: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#E65100',
  },
  recommendationCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  recommendationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  recommendationTextHindi: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E65100',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  voiceButtonActive: {
    backgroundColor: '#F44336',
  },
  voiceButtonIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  voiceButtonTextContainer: {
    flex: 1,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  voiceButtonTextHindi: {
    fontSize: 13,
    color: '#FFCCBC',
    marginTop: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitleHindi: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 100,
  },
  mandiCard: {
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
  bestMandiCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mandiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mandiNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  mandiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mandiNameHindi: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  trendBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  bestPriceValue: {
    color: '#2E7D32',
  },
  priceUnit: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  changeContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  changeLabel: {
    fontSize: 11,
    color: '#888',
  },
  changeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  cropPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 30,
  },
  cropPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cropPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  cropPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cropPickerItemSelected: {
    backgroundColor: '#FFF3E0',
  },
  cropPickerItemIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cropPickerItemText: {
    flex: 1,
  },
  cropPickerItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cropPickerItemNameSelected: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  cropPickerItemNameHindi: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 22,
    color: '#E65100',
    fontWeight: 'bold',
  },
});

export default MarketPricesScreen;
