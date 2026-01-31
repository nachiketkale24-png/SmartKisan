import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'DiseaseScan'>;

// Mock AI Disease Detection Results
const mockDiseaseResults = [
  {
    diseaseName: 'Leaf Rust',
    diseaseNameHindi: 'पत्ती का जंग',
    severity: 'Medium' as const,
    cause: 'High humidity and fungal spores spread through wind. The disease thrives in warm, moist conditions and can spread rapidly if not controlled.',
    causeHindi: 'उच्च आर्द्रता और हवा के माध्यम से फैलने वाले कवक बीजाणु। यह रोग गर्म, नम परिस्थितियों में पनपता है।',
    solution: 'Apply fungicide spray (Propiconazole or Tebuconazole) every 7-10 days. Reduce irrigation frequency and ensure proper drainage. Remove severely infected leaves.',
    solutionHindi: 'हर 7-10 दिनों में कवकनाशी स्प्रे करें। सिंचाई कम करें और उचित जल निकासी सुनिश्चित करें।',
    prevention: 'Use disease-resistant varieties. Maintain proper plant spacing for air circulation. Avoid overhead irrigation. Regular field monitoring.',
    preventionHindi: 'रोग-प्रतिरोधी किस्मों का उपयोग करें। हवा के संचार के लिए उचित पौधों की दूरी बनाए रखें।',
  },
  {
    diseaseName: 'Bacterial Leaf Blight',
    diseaseNameHindi: 'बैक्टीरियल पत्ती झुलसा',
    severity: 'High' as const,
    cause: 'Caused by Xanthomonas oryzae bacteria. Spreads through contaminated water, infected seeds, and crop residue. Warm, humid weather accelerates spread.',
    causeHindi: 'Xanthomonas oryzae बैक्टीरिया के कारण। दूषित पानी और संक्रमित बीजों से फैलता है।',
    solution: 'Apply copper-based bactericides. Drain excess water from fields. Use balanced fertilization - avoid excess nitrogen. Apply streptocyclin spray.',
    solutionHindi: 'तांबा आधारित जीवाणुनाशक लगाएं। खेतों से अतिरिक्त पानी निकालें। संतुलित उर्वरक का उपयोग करें।',
    prevention: 'Use certified disease-free seeds. Practice crop rotation. Destroy infected plant debris. Maintain field hygiene.',
    preventionHindi: 'प्रमाणित रोग-मुक्त बीजों का उपयोग करें। फसल चक्र अपनाएं। संक्रमित पौधों के अवशेषों को नष्ट करें।',
  },
  {
    diseaseName: 'Powdery Mildew',
    diseaseNameHindi: 'चूर्णिल आसिता',
    severity: 'Low' as const,
    cause: 'Fungal infection caused by Erysiphe species. Favored by moderate temperatures (20-25°C), high humidity, and poor air circulation.',
    causeHindi: 'Erysiphe प्रजातियों के कारण कवक संक्रमण। मध्यम तापमान और उच्च आर्द्रता में पनपता है।',
    solution: 'Apply sulfur-based fungicides. Spray neem oil solution. Ensure adequate sunlight reaches plants. Remove heavily infected parts.',
    solutionHindi: 'गंधक आधारित कवकनाशी लगाएं। नीम तेल का घोल छिड़कें। पर्याप्त धूप सुनिश्चित करें।',
    prevention: 'Choose resistant varieties. Maintain proper spacing. Avoid excessive nitrogen fertilizers. Regular pruning for air flow.',
    preventionHindi: 'प्रतिरोधी किस्में चुनें। उचित दूरी बनाए रखें। अत्यधिक नाइट्रोजन उर्वरकों से बचें।',
  },
  {
    diseaseName: 'Root Rot',
    diseaseNameHindi: 'जड़ सड़न',
    severity: 'High' as const,
    cause: 'Caused by soil-borne fungi (Pythium, Phytophthora, Fusarium). Overwatering and poor drainage create ideal conditions for these pathogens.',
    causeHindi: 'मिट्टी जनित कवक के कारण। अधिक पानी और खराब जल निकासी इसे बढ़ावा देती है।',
    solution: 'Improve drainage immediately. Apply fungicide drench (Metalaxyl). Reduce watering frequency. Apply Trichoderma-based bio-fungicides.',
    solutionHindi: 'तुरंत जल निकासी में सुधार करें। कवकनाशी लगाएं। पानी की आवृत्ति कम करें।',
    prevention: 'Ensure proper field drainage. Avoid waterlogging. Use raised beds if needed. Practice crop rotation with non-host crops.',
    preventionHindi: 'उचित खेत जल निकासी सुनिश्चित करें। जलभराव से बचें। यदि आवश्यक हो तो उठी हुई क्यारियों का उपयोग करें।',
  },
  {
    diseaseName: 'Aphid Infestation',
    diseaseNameHindi: 'एफिड का प्रकोप',
    severity: 'Medium' as const,
    cause: 'Small sap-sucking insects that multiply rapidly in warm weather. They also transmit viral diseases and excrete honeydew leading to sooty mold.',
    causeHindi: 'छोटे रस चूसने वाले कीड़े जो गर्म मौसम में तेजी से बढ़ते हैं। ये वायरल रोग भी फैलाते हैं।',
    solution: 'Spray neem-based insecticide. Release natural predators like ladybugs. Use yellow sticky traps. Apply soap solution spray for immediate relief.',
    solutionHindi: 'नीम आधारित कीटनाशक छिड़कें। प्राकृतिक शिकारियों जैसे लेडीबग को छोड़ें। पीले चिपचिपे जाल का उपयोग करें।',
    prevention: 'Regular monitoring. Maintain beneficial insect populations. Avoid excessive nitrogen. Remove weeds that harbor aphids.',
    preventionHindi: 'नियमित निगरानी। लाभकारी कीट आबादी बनाए रखें। अत्यधिक नाइट्रोजन से बचें।',
  },
];

const DiseaseScanScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { cropId, cropName, imageUri } = route.params;

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const simulateAIDetection = () => {
    // Randomly select a disease result from mock data
    const randomIndex = Math.floor(Math.random() * mockDiseaseResults.length);
    return mockDiseaseResults[randomIndex];
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    // Simulate AI processing delay
    setTimeout(async () => {
      const result = simulateAIDetection();

      // Store the scan result
      const newScan = {
        id: Date.now().toString(),
        cropId,
        diseaseName: result.diseaseName,
        diseaseNameHindi: result.diseaseNameHindi,
        detectedDate: new Date().toISOString().split('T')[0],
        status: 'Active' as const,
        severity: result.severity,
        cause: result.cause,
        solution: result.solution,
        prevention: result.prevention,
        imageUri,
      };

      try {
        // Load existing scans
        const existingScans = await AsyncStorage.getItem(`disease_scans_${cropId}`);
        const scans = existingScans ? JSON.parse(existingScans) : [];
        scans.unshift(newScan);

        // Save updated scans
        await AsyncStorage.setItem(`disease_scans_${cropId}`, JSON.stringify(scans));
      } catch (error) {
        console.log('Error saving scan:', error);
      }

      setIsAnalyzing(false);

      // Navigate to result screen
      navigation.navigate('DiseaseResult', {
        diseaseName: result.diseaseName,
        diseaseNameHindi: result.diseaseNameHindi,
        severity: result.severity,
        cause: result.cause,
        causeHindi: result.causeHindi,
        solution: result.solution,
        solutionHindi: result.solutionHindi,
        prevention: result.prevention,
        preventionHindi: result.preventionHindi,
        imageUri,
        cropName,
      });
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔬 Analyze Crop</Text>
          <Text style={styles.headerTitleHindi}>फसल का विश्लेषण करें</Text>
        </View>

        {/* Crop Info */}
        <View style={styles.cropInfoBadge}>
          <Text style={styles.cropInfoText}>🌾 {cropName}</Text>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageLabel}>Captured Image</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Analysis Process</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionIcon}>1️⃣</Text>
            <Text style={styles.instructionText}>
              AI will scan the image for disease patterns
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionIcon}>2️⃣</Text>
            <Text style={styles.instructionText}>
              Compare with 1000+ disease signatures
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionIcon}>3️⃣</Text>
            <Text style={styles.instructionText}>
              Get detailed diagnosis & treatment
            </Text>
          </View>
        </View>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
          activeOpacity={0.8}
        >
          {isAnalyzing ? (
            <View style={styles.analyzingContent}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.analyzingText}>Analyzing...</Text>
              <Text style={styles.analyzingTextHindi}>विश्लेषण हो रहा है...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.analyzeIcon}>🔍</Text>
              <View style={styles.analyzeTextContainer}>
                <Text style={styles.analyzeText}>Analyze Crop Health</Text>
                <Text style={styles.analyzeTextHindi}>
                  फसल स्वास्थ्य का विश्लेषण करें
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={styles.disclaimerText}>
            AI analysis is for guidance only. For severe infections, consult an
            agricultural expert.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#2E7D32',
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
    color: '#E8F5E9',
    marginTop: 4,
  },
  cropInfoBadge: {
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
  cropInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  imageContainer: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  previewImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
  },
  imageLabel: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  analyzeButton: {
    backgroundColor: '#2E7D32',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minHeight: 80,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#81C784',
  },
  analyzeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  analyzeTextContainer: {
    alignItems: 'flex-start',
  },
  analyzeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  analyzeTextHindi: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 4,
  },
  analyzingContent: {
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  analyzingTextHindi: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 4,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
  },
});

export default DiseaseScanScreen;
