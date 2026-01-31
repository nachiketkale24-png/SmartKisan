import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types';
import {
  getSchemeById,
  Scheme,
  checkEligibility,
  EligibilityResult,
  getSchemeSummaryForVoice,
  formatDate,
  formatDateHindi,
  getDaysRemaining,
} from '../services/schemeService';

type RouteProps = RouteProp<RootStackParamList, 'SchemeDetail'>;

const SchemeDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { schemeId } = route.params;

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);

  useEffect(() => {
    loadScheme();
  }, [schemeId]);

  const loadScheme = async () => {
    const data = await getSchemeById(schemeId);
    setScheme(data);
  };

  const handleCheckEligibility = async () => {
    if (!scheme) return;
    
    setIsCheckingEligibility(true);
    const result = await checkEligibility(scheme);
    setEligibilityResult(result);
    setIsCheckingEligibility(false);
  };

  const speakText = async (text: string, section: string) => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      await Speech.stop();
      if (speakingSection === section) {
        setIsSpeaking(false);
        setSpeakingSection(null);
        return;
      }
    }

    setIsSpeaking(true);
    setSpeakingSection(section);

    await Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.85,
      onDone: () => {
        setIsSpeaking(false);
        setSpeakingSection(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingSection(null);
      },
    });
  };

  const speakFullSchemeInfo = async () => {
    if (!scheme) return;
    const summary = getSchemeSummaryForVoice(scheme, 'hi');
    await speakText(summary, 'full');
  };

  const speakEligibilityResult = async () => {
    if (!eligibilityResult) return;
    
    let text = '';
    if (eligibilityResult.isEligible) {
      text = 'बधाई हो! आप इस योजना के लिए पात्र हैं। ';
      text += eligibilityResult.matchedCriteriaHindi.join('। ');
    } else {
      text = 'आप इस योजना के लिए पात्र नहीं हैं। ';
      text += 'निम्नलिखित शर्तें पूरी नहीं हैं: ';
      text += eligibilityResult.missingRequirementsHindi.join('। ');
    }
    
    await speakText(text, 'eligibility');
  };

  const handleApply = () => {
    if (!scheme) return;
    
    if (scheme.applyLink) {
      Alert.alert(
        'Apply Online',
        `You will be redirected to ${scheme.applyLink}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => Linking.openURL(scheme.applyLink) },
        ]
      );
    } else {
      Alert.alert(
        'Apply at Bank/Office',
        'Please visit your nearest bank branch or agriculture office to apply for this scheme.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!scheme) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const daysRemaining = getDaysRemaining(scheme.deadline);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 Scheme Details</Text>
          <Text style={styles.headerTitleHindi}>योजना विवरण</Text>
        </View>

        {/* Scheme Name Card */}
        <View style={styles.nameCard}>
          <View style={styles.nameIconContainer}>
            <Text style={styles.nameIcon}>🏛️</Text>
          </View>
          <Text style={styles.schemeName}>{scheme.name}</Text>
          <Text style={styles.schemeNameHindi}>{scheme.nameHindi}</Text>
          
          <View style={styles.benefitBadge}>
            <Text style={styles.benefitIcon}>💰</Text>
            <Text style={styles.benefitText}>{scheme.benefit}</Text>
          </View>
        </View>

        {/* Deadline Card */}
        <View style={[
          styles.deadlineCard,
          daysRemaining <= 30 && { backgroundColor: '#FFF3E0' }
        ]}>
          <View style={styles.deadlineRow}>
            <Text style={styles.deadlineIcon}>📅</Text>
            <View style={styles.deadlineInfo}>
              <Text style={styles.deadlineLabel}>Application Deadline / आवेदन की अंतिम तिथि</Text>
              <Text style={styles.deadlineValue}>{formatDate(scheme.deadline)}</Text>
              <Text style={styles.deadlineValueHindi}>{formatDateHindi(scheme.deadline)}</Text>
            </View>
          </View>
          {daysRemaining > 0 && (
            <View style={styles.daysRemainingBadge}>
              <Text style={styles.daysRemainingText}>
                ⏰ {daysRemaining} days remaining / {daysRemaining} दिन बाकी
              </Text>
            </View>
          )}
        </View>

        {/* Listen Button */}
        <TouchableOpacity
          style={[styles.listenButton, speakingSection === 'full' && styles.listenButtonActive]}
          onPress={speakFullSchemeInfo}
        >
          <Text style={styles.listenIcon}>{speakingSection === 'full' ? '⏹️' : '🔊'}</Text>
          <View style={styles.listenTextContainer}>
            <Text style={styles.listenText}>
              {speakingSection === 'full' ? 'Stop' : 'Listen Scheme Info'}
            </Text>
            <Text style={styles.listenTextHindi}>
              {speakingSection === 'full' ? 'रोकें' : 'योजना की जानकारी सुनें'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Description / विवरण</Text>
          </View>
          <Text style={styles.sectionContent}>{scheme.description}</Text>
          <Text style={styles.sectionContentHindi}>{scheme.descriptionHindi}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✅</Text>
            <Text style={styles.sectionTitle}>Benefits / लाभ</Text>
          </View>
          {scheme.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitItemText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Eligibility Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Eligibility / पात्रता</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityIcon}>🌾</Text>
            <Text style={styles.eligibilityText}>
              Land Size: Up to {scheme.eligibility.maxLandSize} acres
            </Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityIcon}>🪪</Text>
            <Text style={styles.eligibilityText}>
              Aadhaar: {scheme.eligibility.aadhaarRequired ? 'Required' : 'Not Required'}
            </Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityIcon}>🏦</Text>
            <Text style={styles.eligibilityText}>
              Bank Account: {scheme.eligibility.bankAccountRequired ? 'Required' : 'Not Required'}
            </Text>
          </View>
          <View style={styles.eligibilityItem}>
            <Text style={styles.eligibilityIcon}>📍</Text>
            <Text style={styles.eligibilityText}>
              States: {scheme.eligibility.states.join(', ')}
            </Text>
          </View>
        </View>

        {/* Required Documents Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📄</Text>
            <Text style={styles.sectionTitle}>Required Documents / आवश्यक दस्तावेज</Text>
          </View>
          {scheme.documents.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.documentBullet}>{index + 1}.</Text>
              <Text style={styles.documentText}>{doc}</Text>
            </View>
          ))}
        </View>

        {/* Apply Method Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🖥️</Text>
            <Text style={styles.sectionTitle}>How to Apply / आवेदन कैसे करें</Text>
          </View>
          <Text style={styles.applyMethodText}>{scheme.applyMethod}</Text>
          {scheme.applyLink && (
            <Text style={styles.applyLinkText}>Website: {scheme.applyLink}</Text>
          )}
        </View>

        {/* Check Eligibility Button */}
        <TouchableOpacity
          style={styles.checkEligibilityButton}
          onPress={handleCheckEligibility}
          disabled={isCheckingEligibility}
        >
          <Text style={styles.checkEligibilityIcon}>🔍</Text>
          <View style={styles.checkEligibilityTextContainer}>
            <Text style={styles.checkEligibilityText}>
              {isCheckingEligibility ? 'Checking...' : 'Check Eligibility'}
            </Text>
            <Text style={styles.checkEligibilityTextHindi}>
              {isCheckingEligibility ? 'जांच हो रही है...' : 'पात्रता जांचें'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Eligibility Result */}
        {eligibilityResult && (
          <View style={[
            styles.eligibilityResultCard,
            eligibilityResult.isEligible ? styles.eligibleCard : styles.notEligibleCard
          ]}>
            <View style={styles.eligibilityResultHeader}>
              <Text style={styles.eligibilityResultIcon}>
                {eligibilityResult.isEligible ? '✅' : '❌'}
              </Text>
              <View style={styles.eligibilityResultInfo}>
                <Text style={styles.eligibilityResultTitle}>
                  {eligibilityResult.isEligible ? 'You are Eligible!' : 'Not Eligible'}
                </Text>
                <Text style={styles.eligibilityResultTitleHindi}>
                  {eligibilityResult.isEligible ? 'आप पात्र हैं!' : 'आप पात्र नहीं हैं'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.speakEligibilityButton}
                onPress={speakEligibilityResult}
              >
                <Text style={styles.speakEligibilityIcon}>
                  {speakingSection === 'eligibility' ? '⏹️' : '🔊'}
                </Text>
              </TouchableOpacity>
            </View>

            {eligibilityResult.isEligible ? (
              <View style={styles.criteriaList}>
                <Text style={styles.criteriaTitle}>✅ Matched Criteria:</Text>
                {eligibilityResult.matchedCriteria.map((criteria, index) => (
                  <Text key={index} style={styles.criteriaItem}>• {criteria}</Text>
                ))}
              </View>
            ) : (
              <View style={styles.criteriaList}>
                <Text style={styles.criteriaTitle}>❌ Missing Requirements:</Text>
                {eligibilityResult.missingRequirements.map((req, index) => (
                  <Text key={index} style={styles.missingItem}>• {req}</Text>
                ))}
                {eligibilityResult.matchedCriteria.length > 0 && (
                  <>
                    <Text style={[styles.criteriaTitle, { marginTop: 12 }]}>
                      ✅ You already have:
                    </Text>
                    {eligibilityResult.matchedCriteria.map((criteria, index) => (
                      <Text key={index} style={styles.criteriaItem}>• {criteria}</Text>
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* Apply Now Button */}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonIcon}>📝</Text>
          <View style={styles.applyButtonTextContainer}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
            <Text style={styles.applyButtonTextHindi}>अभी आवेदन करें</Text>
          </View>
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
  header: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitleHindi: {
    fontSize: 16,
    color: '#BBDEFB',
    marginTop: 4,
  },
  nameCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: -15,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nameIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameIcon: {
    fontSize: 36,
  },
  schemeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  schemeNameHindi: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  benefitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  deadlineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineLabel: {
    fontSize: 12,
    color: '#888',
  },
  deadlineValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  deadlineValueHindi: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  daysRemainingBadge: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  daysRemainingText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
    textAlign: 'center',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  listenButtonActive: {
    backgroundColor: '#F44336',
  },
  listenIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  listenTextContainer: {
    flex: 1,
  },
  listenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listenTextHindi: {
    fontSize: 13,
    color: '#BBDEFB',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  sectionContentHindi: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginTop: 10,
    fontStyle: 'italic',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitBullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 10,
    fontWeight: 'bold',
  },
  benefitItemText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  eligibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
  },
  eligibilityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  eligibilityText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentBullet: {
    fontSize: 14,
    color: '#1565C0',
    marginRight: 10,
    fontWeight: 'bold',
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  applyMethodText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  applyLinkText: {
    fontSize: 13,
    color: '#1565C0',
    marginTop: 8,
  },
  checkEligibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  checkEligibilityIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  checkEligibilityTextContainer: {
    flex: 1,
  },
  checkEligibilityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  checkEligibilityTextHindi: {
    fontSize: 14,
    color: '#FFF8E1',
    marginTop: 2,
  },
  eligibilityResultCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  eligibleCard: {
    backgroundColor: '#E8F5E9',
  },
  notEligibleCard: {
    backgroundColor: '#FFEBEE',
  },
  eligibilityResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eligibilityResultIcon: {
    fontSize: 40,
    marginRight: 14,
  },
  eligibilityResultInfo: {
    flex: 1,
  },
  eligibilityResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  eligibilityResultTitleHindi: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  speakEligibilityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakEligibilityIcon: {
    fontSize: 24,
  },
  criteriaList: {
    marginTop: 16,
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  criteriaItem: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
    marginLeft: 8,
  },
  missingItem: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 4,
    marginLeft: 8,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  applyButtonIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  applyButtonTextContainer: {
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  applyButtonTextHindi: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SchemeDetailScreen;
