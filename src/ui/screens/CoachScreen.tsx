/**
 * AI Financial Coach Chat & Diagnostics Screen
 * Context-aware pedagogical mentor answering user queries and explaining financial decisions.
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
import { colors } from '../theme/colors';
import { useSimulationStore } from '../../store/useSimulationStore';
import { BehaviorRules } from '../../intelligence/behaviorRules';

export const CoachScreen: React.FC = () => {
  const profile = useSimulationStore((state) => state.profile);
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
    'What is an emergency fund and why do I need one?',
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
        {/* Coach Header & Archetype Banner */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.coachAvatar}>
              <Ionicons name="sparkles" size={18} color="#000000" />
            </View>
            <View>
              <Text style={styles.coachTitle}>AI Financial Coach</Text>
              <Text style={styles.archetypeText}>
                Archetype: <Text style={{ color: colors.secondaryLight, fontWeight: '800' }}>{diagnosis.primaryTrait}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.offlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.offlineText}>Active</Text>
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
                {!isUser && (
                  <View style={styles.coachHeaderRow}>
                    <Ionicons name="school" size={14} color={colors.secondaryLight} />
                    <Text style={styles.coachBubbleTag}>Financial Coach</Text>
                  </View>
                )}
                <Text style={[styles.messageText, isUser ? styles.userText : styles.coachText]}>
                  {msg.text}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Question Pills */}
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

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputQuery}
            onChangeText={setInputQuery}
            placeholder="Ask your coach anything about money..."
            placeholderTextColor={colors.textMuted}
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
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  archetypeText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 14,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  coachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  coachBubbleTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.secondaryLight,
    textTransform: 'uppercase',
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
    color: colors.text,
  },
  userText: {
    color: '#000000',
    fontWeight: '700',
  },
  quickPromptsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  quickPromptPill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    gap: 8,
    borderTopWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
});
