/**
 * Life Simulation Screen — Gamified Turn Arena
 * Features Reigns-style swipe dilemma cards, comic consequence vignettes, and witty mascot quips.
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
import { SwipeDilemmaCard } from '../components/SwipeDilemmaCard';
import { ComicConsequenceModal } from '../components/ComicConsequenceModal';
import { MascotCompanion } from '../components/MascotCompanion';
import { FlyingCoins } from '../components/FlyingCoins';
import { formatINR } from '../components/CurrencyText';

export const LifeScreen: React.FC = () => {
  const [coinBurstKey, setCoinBurstKey] = useState(0);

  const profile = useSimulationStore((state) => state.profile);
  const balanceSheet = useSimulationStore((state) => state.balanceSheet);
  const budget = useSimulationStore((state) => state.budget);
  const health = useSimulationStore((state) => state.healthScore);
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
        {/* Timeline & Turn Header */}
        <View style={styles.timelineHeader}>
          <View>
            <Text style={styles.stageTag}>{profile.currentStage.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.dateTitle}>
              Month {profile.currentMonth} • Age {profile.currentAge}
            </Text>
          </View>
          <View style={styles.turnPill}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
            <Text style={styles.turnText}>Turn {profile.totalMonthsSimulated + 1}</Text>
          </View>
        </View>

        {/* Witty Mascot Companion Bubble */}
        <MascotCompanion balanceSheet={balanceSheet} health={health} age={profile.currentAge} />

        {/* Hero Interactive Area: Reigns Swipe Card OR Calm Month */}
        {currentEvent ? (
          <View style={styles.swipeSection}>
            <View style={styles.swipePromptHeader}>
              <Text style={styles.swipeInstructions}>
                👈 SWIPE TO DECIDE 👉
              </Text>
            </View>

            <SwipeDilemmaCard
              key={currentEvent.id}
              event={currentEvent}
              onSelectOption={(option) => selectDecision(option)}
            />
          </View>
        ) : (
          <View style={styles.calmMonthBox}>
            <View style={styles.calmIconBubble}>
              <Ionicons name="sunny" size={32} color={colors.primary} />
            </View>
            <Text style={styles.calmTitle}>Smooth Month</Text>
            <Text style={styles.calmSubtitle}>
              Salary of {formatINR(budget.baseSalary)} credited! Essentials paid, SIPs compounding. No unexpected crises.
            </Text>

            <TouchableOpacity style={styles.nextMonthBtn} activeOpacity={0.85} onPress={handleAdvance}>
              <Ionicons name="play-forward" size={18} color="#0B0F19" />
              <Text style={styles.nextMonthText}>Advance to Next Month</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Decision History Feed */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Decisions ({decisionLogs.length})</Text>

          {decisionLogs.length === 0 ? (
            <Text style={styles.emptyHistory}>Swipe your first dilemma card above to record history!</Text>
          ) : (
            decisionLogs.slice(0, 4).map((log) => {
              const isPositive = log.consequence.financialHealthDelta >= 0;
              return (
                <View key={log.id} style={styles.historyCard}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyTitle}>{log.eventTitle}</Text>
                    <View
                      style={[
                        styles.historyPill,
                        { backgroundColor: isPositive ? colors.primaryGlow : colors.dangerGlow },
                      ]}
                    >
                      <Text
                        style={[
                          styles.historyPillText,
                          { color: isPositive ? colors.primaryLight : colors.dangerLight },
                        ]}
                      >
                        {isPositive ? '+' : ''}{log.consequence.financialHealthDelta} pts
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyChoice}>You chose: {log.selectedOptionTitle}</Text>
                  <Text style={styles.historyLesson}>{log.consequence.financialLesson}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Flying Coins Burst Particle */}
      <FlyingCoins triggerKey={coinBurstKey} />

      {/* 3-Panel Comic Consequence Storyboard */}
      <ComicConsequenceModal
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
    marginBottom: 4,
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
    marginTop: 1,
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
    fontWeight: '800',
    color: colors.accent,
  },
  swipeSection: {
    marginVertical: 4,
  },
  swipePromptHeader: {
    alignItems: 'center',
    marginBottom: 2,
  },
  swipeInstructions: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  calmMonthBox: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    marginVertical: 14,
  },
  calmIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  calmTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  calmSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  nextMonthBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextMonthText: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '900',
  },
  historySection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyHistory: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  historyPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  historyChoice: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 2,
  },
  historyLesson: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
});
