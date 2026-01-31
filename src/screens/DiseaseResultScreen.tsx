import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'DiseaseResult'>;

const DiseaseResultScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const {
    diseaseName,
    diseaseNameHindi,
    severity,
    cause,
    causeHindi,
    solution,
    solutionHindi,
    prevention,
    preventionHindi,
    imageUri,
    cropName,
  } = route.params;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
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

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'Low':
        return '🟢';
      case 'Medium':
        return '🟡';
      case 'High':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getSeverityHindi = (sev: string) => {
    switch (sev) {
      case 'Low':
        return 'कम';
      case 'Medium':
        return 'मध्यम';
      case 'High':
        return 'गंभीर';
      default:
        return 'अज्ञात';
    }
  };

  const speakText = async (text: string, section: string) => {
    try {
      // Stop any ongoing speech
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
        language: 'en-IN',
        pitch: 1.0,
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
    } catch (error) {
      console.log('Speech error:', error);
      setIsSpeaking(false);
      setSpeakingSection(null);
    }
  };

  const speakFullDiagnosis = async () => {
    const fullText = `
      Disease detected: ${diseaseName}. 
      Severity level: ${severity}.
      
      Cause: ${cause}.
      
      Recommended Solution: ${solution}.
      
      Prevention Tips: ${prevention}.
    `;

    await speakText(fullText, 'full');
  };

  const stopSpeaking = async () => {
    await Speech.stop();
    setIsSpeaking(false);
    setSpeakingSection(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔬 Diagnosis Result</Text>
          <Text style={styles.headerTitleHindi}>निदान परिणाम</Text>
        </View>

        {/* Crop Badge */}
        <View style={styles.cropBadge}>
          <Text style={styles.cropBadgeText}>🌾 {cropName}</Text>
        </View>

        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          </View>
        )}

        {/* Disease Name Card */}
        <View style={styles.diseaseNameCard}>
          <View style={styles.diseaseIconContainer}>
            <Text style={styles.diseaseIcon}>🦠</Text>
          </View>
          <View style={styles.diseaseNameInfo}>
            <Text style={styles.diseaseLabel}>Detected Disease</Text>
            <Text style={styles.diseaseName}>{diseaseName}</Text>
            {diseaseNameHindi && (
              <Text style={styles.diseaseNameHindi}>{diseaseNameHindi}</Text>
            )}
          </View>
        </View>

        {/* Severity Level */}
        <View
          style={[
            styles.severityCard,
            { backgroundColor: getSeverityColor(severity) + '15' },
          ]}
        >
          <Text style={styles.severityIcon}>{getSeverityIcon(severity)}</Text>
          <View style={styles.severityInfo}>
            <Text style={styles.severityLabel}>Severity Level / गंभीरता</Text>
            <Text
              style={[styles.severityValue, { color: getSeverityColor(severity) }]}
            >
              {severity} ({getSeverityHindi(severity)})
            </Text>
          </View>
        </View>

        {/* Cause Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>❓</Text>
              <View>
                <Text style={styles.sectionTitle}>Why it happened</Text>
                <Text style={styles.sectionTitleHindi}>यह क्यों हुआ</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.speakButton,
                speakingSection === 'cause' && styles.speakButtonActive,
              ]}
              onPress={() => speakText(cause, 'cause')}
            >
              <Text style={styles.speakButtonIcon}>
                {speakingSection === 'cause' ? '⏹️' : '🔊'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>{cause}</Text>
          {causeHindi && (
            <Text style={styles.sectionContentHindi}>{causeHindi}</Text>
          )}
        </View>

        {/* Solution Section */}
        <View style={[styles.sectionCard, styles.solutionCard]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>💊</Text>
              <View>
                <Text style={styles.sectionTitle}>Recommended Solution</Text>
                <Text style={styles.sectionTitleHindi}>अनुशंसित समाधान</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.speakButton,
                speakingSection === 'solution' && styles.speakButtonActive,
              ]}
              onPress={() => speakText(solution, 'solution')}
            >
              <Text style={styles.speakButtonIcon}>
                {speakingSection === 'solution' ? '⏹️' : '🔊'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>{solution}</Text>
          {solutionHindi && (
            <Text style={styles.sectionContentHindi}>{solutionHindi}</Text>
          )}
        </View>

        {/* Prevention Section */}
        <View style={[styles.sectionCard, styles.preventionCard]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>🛡️</Text>
              <View>
                <Text style={styles.sectionTitle}>Prevention Tips</Text>
                <Text style={styles.sectionTitleHindi}>रोकथाम के उपाय</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.speakButton,
                speakingSection === 'prevention' && styles.speakButtonActive,
              ]}
              onPress={() => speakText(prevention, 'prevention')}
            >
              <Text style={styles.speakButtonIcon}>
                {speakingSection === 'prevention' ? '⏹️' : '🔊'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>{prevention}</Text>
          {preventionHindi && (
            <Text style={styles.sectionContentHindi}>{preventionHindi}</Text>
          )}
        </View>

        {/* Full Listen Button */}
        <TouchableOpacity
          style={[
            styles.listenFullButton,
            isSpeaking && speakingSection === 'full' && styles.listenFullButtonActive,
          ]}
          onPress={isSpeaking ? stopSpeaking : speakFullDiagnosis}
          activeOpacity={0.8}
        >
          <Text style={styles.listenFullIcon}>
            {isSpeaking && speakingSection === 'full' ? '⏹️' : '🔊'}
          </Text>
          <View style={styles.listenFullTextContainer}>
            <Text style={styles.listenFullText}>
              {isSpeaking && speakingSection === 'full'
                ? 'Stop Listening'
                : 'Listen Full Diagnosis'}
            </Text>
            <Text style={styles.listenFullTextHindi}>
              {isSpeaking && speakingSection === 'full'
                ? 'सुनना बंद करें'
                : 'पूरा निदान सुनें'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Expert Consultation Card */}
        <View style={styles.consultCard}>
          <Text style={styles.consultIcon}>👨‍🌾</Text>
          <View style={styles.consultInfo}>
            <Text style={styles.consultTitle}>Need Expert Help?</Text>
            <Text style={styles.consultText}>
              For severe cases, consult your local agricultural officer or Krishi
              Vigyan Kendra.
            </Text>
          </View>
        </View>

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
  header: {
    backgroundColor: '#FF9800',
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
    color: '#FFF8E1',
    marginTop: 4,
  },
  cropBadge: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: -15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cropBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  imageContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  diseaseNameCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  diseaseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  diseaseIcon: {
    fontSize: 30,
  },
  diseaseNameInfo: {
    flex: 1,
  },
  diseaseLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  diseaseNameHindi: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  severityCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  severityInfo: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
  },
  severityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
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
  solutionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  preventionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitleHindi: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  speakButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakButtonActive: {
    backgroundColor: '#2196F3',
  },
  speakButtonIcon: {
    fontSize: 22,
  },
  sectionContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  sectionContentHindi: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 12,
    fontStyle: 'italic',
  },
  listenFullButton: {
    backgroundColor: '#1976D2',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  listenFullButtonActive: {
    backgroundColor: '#F44336',
  },
  listenFullIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  listenFullTextContainer: {
    alignItems: 'flex-start',
  },
  listenFullText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listenFullTextHindi: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 2,
  },
  consultCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  consultIcon: {
    fontSize: 40,
    marginRight: 14,
  },
  consultInfo: {
    flex: 1,
  },
  consultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  consultText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default DiseaseResultScreen;
