/**
 * Life Simulation Screen
 * Core decision arena: Turn-based monthly progression, scenario dilemmas, and decision logs.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../../store/useSimulationStore';
import { DecisionCard } from '../components/DecisionCard';
import { ConsequenceModal } from '../components/ConsequenceModal';
import { FlyingCoins } from '../components/FlyingCoins';
import { formatINR } from '../components/CurrencyText';

export const LifeScreen: React.FC = () => {
  const [coinBurstKey, setCoinBurstKey] = useState(0);

  const profile = useSimulationStore((state) => state.profile);
  const budget = useSimulationStore((state) => state.budget);
  const currentEvent = useSimulationStore((state) => state.currentEvent);
  const decisionLogs = useSimulationStore((state) => state.decisionLogs);
  const lastConsequence = useSimulationStore((state) => state.lastConsequence);

  const selectDecision = useSimulationStore((state) => state.selectDecision);
  const dismissConsequence = useSimulationStore((state) => state.dismissConsequence);
  const advanceMonth = useSimulationStore((state) => state.advanceMonth);

  const handleAdvance = () => {
    setCoinBurstKey((prev) => prev + 1);
    advanceMonth();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stage Timeline Header */}
        <View style={styles.timelineHeader}>
          <View>
            <Text style={styles.stageTag}>{profile.currentStage.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.dateTitle}>
              Year {Math.floor(profile.totalMonthsSimulated / 12) + 1} • Month {profile.currentMonth} (Age {profile.currentAge})
            </Text>
          </View>
          <View style={styles.turnPill}>
            <Ionicons name="hourglass-outline" size={14} color={colors.accent} />
            <Text style={styles.turnText}>Turn {profile.totalMonthsSimulated + 1}</Text>
          </View>
        </View>

        {/* Active Scenario Card */}
        {currentEvent ? (
          <View style={styles.eventBox}>
            <View style={styles.eventBadgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: currentEvent.accentColor + '25' }]}>
                <Ionicons name={currentEvent.icon as any} size={14} color={currentEvent.accentColor} />
                <Text style={[styles.categoryText, { color: currentEvent.accentColor }]}>
                  {currentEvent.category.toUpperCase()} SCENARIO
                </Text>
              </View>
            </View>

            <Text style={styles.eventTitle}>{currentEvent.title}</Text>
            <Text style={styles.eventHeadline}>{currentEvent.headline}</Text>
            <Text style={styles.eventDescription}>{currentEvent.storyDescription}</Text>

            <Text style={styles.optionsPrompt}>Choose your financial decision:</Text>

            {currentEvent.options.map((opt, idx) => (
              <DecisionCard
                key={opt.id}
                option={opt}
                index={idx}
                onSelect={(selected) => selectDecision(selected)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.calmMonthBox}>
            <View style={styles.calmIconBubble}>
              <Ionicons name="sunny" size={32} color={colors.primary} />
            </View>
            <Text style={styles.calmTitle}>Smooth Financial Month</Text>
            <Text style={styles.calmSubtitle}>
              No acute crises this turn. Salary of {formatINR(budget.baseSalary)} credited, budgeted living expenses settled, and active investments compounded.
            </Text>

            <TouchableOpacity style={styles.nextMonthBtn} activeOpacity={0.85} onPress={handleAdvance}>
              <Ionicons name="play-forward" size={18} color="#0B0F19" />
              <Text style={styles.nextMonthText}>Advance to Next Month</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Life Decision History Log */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Life Decision History ({decisionLogs.length})</Text>

          {decisionLogs.length === 0 ? (
            <Text style={styles.emptyHistory}>No decisions recorded yet. Play your first scenario!</Text>
          ) : (
            decisionLogs.slice(0, 5).map((log) => {
              const isPositive = log.consequence.financialHealthDelta >= 0;
              return (
                <View key={log.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyEventTitle}>{log.eventTitle}</Text>
                    <View
                      style={[
                        styles.historyDelta,
                        { backgroundColor: isPositive ? colors.primaryGlow : colors.dangerGlow },
                      ]}
                    >
                      <Text
                        style={[
                          styles.historyDeltaText,
                          { color: isPositive ? colors.primaryLight : colors.dangerLight },
                        ]}
                      >
                        {isPositive ? '+' : ''}
                        {log.consequence.financialHealthDelta} pts
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyChoice}>Selected: {log.selectedOptionTitle}</Text>
                  <Text style={styles.historyLesson}>{log.consequence.financialLesson}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Flying Coins Effect */}
      <FlyingCoins triggerKey={coinBurstKey} />

      {/* Consequence Modal */}
      <ConsequenceModal
        visible={lastConsequence !== null}
        consequence={lastConsequence}
        onDismiss={dismissConsequence}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stageTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginTop: 2,
  },
  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  turnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  eventBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  eventBadgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
  },
  eventHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentLight,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
  optionsPrompt: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  calmMonthBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  calmIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  calmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  calmSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  nextMonthBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextMonthText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '800',
  },
  historySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyHistory: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyEventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  historyDelta: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyDeltaText: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyChoice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
    marginBottom: 4,
  },
  historyLesson: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
