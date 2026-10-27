/**
 * Life Simulation Screen — Simplistic Minimalist UI
 * Clean, focused dilemma arena with zero distraction.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimulationStore } from '../../store/useSimulationStore';
import { SwipeDilemmaCard } from '../components/SwipeDilemmaCard';
import { ComicConsequenceModal } from '../components/ComicConsequenceModal';
import { FlyingCoins } from '../components/FlyingCoins';
import { formatINR } from '../components/CurrencyText';
import { CareerLadderGraph } from '../components/CareerLadderGraph';

export const LifeScreen: React.FC = () => {
  const [coinBurstKey, setCoinBurstKey] = useState(0);

  const profile = useSimulationStore((state) => state.profile);
  const budget = useSimulationStore((state) => state.budget);
  const currentEvent = useSimulationStore((state) => state.currentEvent);
  const decisionLogs = useSimulationStore((state) => state.decisionLogs);
  const lastConsequence = useSimulationStore((state) => state.lastConsequence);
  const monthsInCurrentRole = useSimulationStore((state) => state.monthsInCurrentRole);

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
        {/* Minimal Timeline Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.stageTag}>{profile.currentStage.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.dateTitle}>
              Month {profile.currentMonth} · Age {profile.currentAge}
            </Text>
          </View>
          <View style={styles.turnBadge}>
            <Text style={styles.turnText}>Turn {profile.totalMonthsSimulated + 1}</Text>
          </View>
        </View>

        {/* Hero Interactive Area: Clean Dilemma Card OR Calm Month */}
        {currentEvent ? (
          <View style={styles.dilemmaArea}>
            <SwipeDilemmaCard
              key={currentEvent.id}
              event={currentEvent}
              onSelectOption={(option) => selectDecision(option)}
            />
          </View>
        ) : (
          <View style={styles.calmCard}>
            <Ionicons name="sunny-outline" size={32} color="#FFFFFF" style={{ marginBottom: 12 }} />
            <Text style={styles.calmTitle}>Smooth Month</Text>
            <Text style={styles.calmSubtitle}>
              Salary of {formatINR(budget.baseSalary)} credited. Essentials paid, investments compounded.
            </Text>

            <TouchableOpacity style={styles.nextMonthBtn} activeOpacity={0.85} onPress={handleAdvance}>
              <Text style={styles.nextMonthText}>Advance to Next Month →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Career Milestone & Promotion Pipeline Node Graph */}
        <CareerLadderGraph
          profile={profile}
          currentSalary={budget.baseSalary}
          monthsInRole={monthsInCurrentRole}
        />

        {/* Recent Decisions Feed (Clean, Quiet List) */}
        {decisionLogs.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionHeader}>PAST CHOICES</Text>
            <View style={styles.historyList}>
              {decisionLogs.slice(0, 3).map((log, idx) => (
                <View
                  key={log.id}
                  style={[
                    styles.historyItem,
                    idx === decisionLogs.slice(0, 3).length - 1 && styles.historyItemLast,
                  ]}
                >
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyTitle}>{log.eventTitle}</Text>
                    <Text style={styles.historyDelta}>
                      {log.consequence.financialHealthDelta >= 0 ? '+' : ''}
                      {log.consequence.financialHealthDelta} pts
                    </Text>
                  </View>
                  <Text style={styles.historyChoiceText}>
                    Chose: {log.selectedOptionTitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Burst & Consequence Modal */}
      <FlyingCoins triggerKey={coinBurstKey} />
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
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stageTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#888888',
    letterSpacing: 0.8,
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  turnBadge: {
    backgroundColor: '#141414',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  turnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A3A3A3',
  },
  dilemmaArea: {
    marginVertical: 4,
  },
  calmCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
    marginVertical: 12,
  },
  calmTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  calmSubtitle: {
    fontSize: 13,
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  nextMonthBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  nextMonthText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  historySection: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1,
    marginBottom: 8,
  },
  historyList: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  historyItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#1C1C1C',
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  historyDelta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A3A3A3',
    marginLeft: 8,
  },
  historyChoiceText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
});
