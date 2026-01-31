import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { t } from '../i18n/translations';
import voiceService from '../services/voiceService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'नमस्ते! मैं आपका कृषि सहायक हूं। आप मुझसे फसलों, सिंचाई, खाद या किसी भी कृषि समस्या के बारे में पूछ सकते हैं।',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickQuestions = [
    'गेहूं में कितना पानी दें?',
    'चावल में रोग कैसे पहचानें?',
    'खाद कब डालें?',
    'फसल की देखभाल कैसे करें?',
  ];

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('पानी') || q.includes('सिंचाई') || q.includes('water')) {
      return 'सिंचाई की मात्रा फसल की अवस्था, मिट्टी के प्रकार और मौसम पर निर्भर करती है। गेहूं के लिए आमतौर पर 4-5 सिंचाई की जरूरत होती है। फूल आने और दाना भरने की अवस्था में सिंचाई बहुत महत्वपूर्ण है। डैशबोर्ड पर आपकी फसलों के लिए विस्तृत सिंचाई सलाह देखें।';
    }

    if (q.includes('रोग') || q.includes('बीमारी') || q.includes('disease')) {
      return 'फसल में रोग के लक्षण देखने के लिए पत्तियों का रंग बदलना, धब्बे पड़ना, मुरझाना या सड़न देखें। अलर्ट सेक्शन में आपकी फसलों के रोगों की जानकारी है। किसी भी संदेह होने पर तुरंत विशेषज्ञ से संपर्क करें।';
    }

    if (q.includes('खाद') || q.includes('उर्वरक') || q.includes('fertilizer')) {
      return 'खाद डालने का सही समय फसल की अवस्था पर निर्भर करता है। बुवाई के समय आधार खुराक, फिर 3-4 सप्ताह बाद और फूल आने से पहले खाद दें। जैविक खाद का उपयोग मिट्टी की सेहत के लिए अच्छा है।';
    }

    if (q.includes('देखभाल') || q.includes('care')) {
      return 'फसल की अच्छी देखभाल के लिए: 1) नियमित सिंचाई करें 2) समय पर खाद दें 3) खरपतवार निकालें 4) रोग-कीट की निगरानी रखें 5) मौसम के अनुसार सुरक्षा करें। डैशबोर्ड पर आज के कामों की सूची देखें।';
    }

    return 'यह एक अच्छा सवाल है। कृषि विशेषज्ञ से सटीक जानकारी के लिए, कृपया अपने नजदीकी कृषि केंद्र से संपर्क करें। मैं सामान्य मार्गदर्शन में आपकी मदद कर सकता हूं। क्या आप सिंचाई, खाद, या रोग प्रबंधन के बारे में जानना चाहते हैं?';
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: getAIResponse(inputText),
      isUser: false,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInputText('');
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: question,
        isUser: true,
        timestamp: new Date(),
      };

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(question),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, aiResponse]);
      setInputText('');
    }, 100);
  };

  const handleSpeakMessage = async (text: string) => {
    if (isSpeaking) {
      await voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await voiceService.speak(text, 'hi');
    } catch (error) {
      console.log('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 {t('assistant', 'hi')}</Text>
        <Text style={styles.headerSubtitle}>AI Farming Assistant</Text>
      </View>

      {/* Quick Questions */}
      <View style={styles.quickSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickContainer}
        >
          {quickQuestions.map((q, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickButton}
              onPress={() => handleQuickQuestion(q)}
            >
              <Text style={styles.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.text}
              </Text>
              {!message.isUser && (
                <TouchableOpacity
                  style={styles.speakButton}
                  onPress={() => handleSpeakMessage(message.text)}
                >
                  <Text style={styles.speakIcon}>🔊</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('askQuestion', 'hi')}
          placeholderTextColor="#9E9E9E"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#673AB7',
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
    color: '#D1C4E9',
    marginTop: 4,
  },
  quickSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  quickContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  quickButton: {
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  quickText: {
    color: '#673AB7',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#673AB7',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#333',
  },
  speakButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
  speakIcon: {
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 50,
    height: 50,
    backgroundColor: '#673AB7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  sendIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});

export default AssistantScreen;
