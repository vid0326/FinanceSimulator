/**
 * AI Financial Coach Screen — Simplistic Minimalist UI
 * Clean, distraction-free advisory conversation.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimulationStore } from '../../store/useSimulationStore';
import { BehaviorRules } from '../../intelligence/behaviorRules';

export const CoachScreen: React.FC = () => {
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const health = useSimulationStore((state) => state.healthScore);
  const decisionLogs = useSimulationStore((state) => state.decisionLogs);
  const coachMessages = useSimulationStore((state) => state.coachMessages);
  const sendCoachMessage = useSimulationStore((state) => state.sendCoachMessage);

  const [inputQuery, setInputQuery] = useState('');

  const diagnosis = BehaviorRules.diagnoseBehavior(decisionLogs, balanceSheet, health);

  const quickPrompts = [
    'Why is my health score at this level?',
    'Should I repay debt or invest in SIP?',
    'How does compounding work for my age?',
    'What is an emergency fund?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;
    sendCoachMessage(query.trim());
    setInputQuery('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Financial Coach</Text>
            <Text style={styles.archetypeText}>
              Persona: {diagnosis.primaryTrait}
            </Text>
          </View>
        </View>

        {/* Messages Feed */}
        <ScrollView
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {coachMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.messageBubble, isUser ? styles.userBubble : styles.coachBubble]}
              >
                <Text style={[styles.messageText, isUser ? styles.userText : styles.coachText]}>
                  {msg.text}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Prompts */}
        <View style={styles.quickPromptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickPrompts.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickPromptPill}
                activeOpacity={0.7}
                onPress={() => handleSend(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Minimal Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputQuery}
            onChangeText={setInputQuery}
            placeholder="Ask anything about your money..."
            placeholderTextColor="#666666"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputQuery.trim() && styles.sendButtonDisabled]}
            disabled={!inputQuery.trim()}
            onPress={() => handleSend()}
          >
            <Ionicons name="arrow-up" size={18} color="#000000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1C1C1C',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  archetypeText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
    fontWeight: '600',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  coachText: {
    color: '#E5E5E5',
    fontWeight: '500',
  },
  userText: {
    color: '#000000',
    fontWeight: '700',
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#1C1C1C',
  },
  quickPromptPill: {
    backgroundColor: '#141414',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A3A3A3',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderColor: '#1C1C1C',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#262626',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.25,
  },
});
