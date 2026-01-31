import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { queryAssistant, checkConnection } from '../services/api';
import { generateOfflineResponse, updateCachedSensors } from '../services/offlineFallback';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '🌾 नमस्ते किसान भाई! मैं आपका कृषि सहायक हूं।\n\nआप मुझसे पूछ सकते हैं:\n• सिंचाई कब करें?\n• तापमान कितना है?\n• खाद कौन सी डालें?\n• फसल की बीमारी',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const flatListRef = useRef(null);

  // Check connection status periodically
  useEffect(() => {
    const checkStatus = async () => {
      const online = await checkConnection();
      setIsOnline(online);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      let responseText;
      
      if (isOnline) {
        // Try online API
        const response = await queryAssistant(messageToSend, 'hi');
        responseText = response.response || response.message || 'कोई जवाब नहीं मिला';
        
        // Update cached sensor data if available
        if (response.sensorData) {
          updateCachedSensors(response.sensorData);
        }
      } else {
        // Use offline fallback
        responseText = generateOfflineResponse(messageToSend, 'hi');
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Fallback to offline
      const offlineResponse = generateOfflineResponse(messageToSend, 'hi');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: offlineResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={[styles.messageText, item.isUser && styles.userText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Connection Status */}
      <View style={[styles.statusBar, isOnline ? styles.online : styles.offline]}>
        <Text style={styles.statusText}>
          {isOnline ? '🟢 ऑनलाइन' : '🔴 ऑफ़लाइन'}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2E7D32" />
          <Text style={styles.loadingText}>सोच रहा हूं...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="अपना सवाल लिखें..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>भेजें</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  online: {
    backgroundColor: '#E8F5E9',
  },
  offline: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: '#2E7D32',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  userText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
