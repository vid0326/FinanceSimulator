/**
 * Onboarding Screen — Simplistic Minimalist UI
 * Clean character setup and starting stage selection.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LifeStage, STAGE_PRESETS } from '../../core/types/profile';
import { useSimulationStore } from '../../store/useSimulationStore';
import { InteractiveAvatar } from '../components/InteractiveAvatar';
import { formatINR } from '../components/CurrencyText';

export const OnboardingScreen: React.FC = () => {
  const [name, setName] = useState('Arjun');
  const [selectedStage, setSelectedStage] = useState<LifeStage>('first_job');
  const initializeSimulation = useSimulationStore((state) => state.initializeSimulation);

  const stages: LifeStage[] = ['student', 'intern', 'first_job', 'experienced'];

  const handleStart = () => {
    initializeSimulation(selectedStage, name.trim() || 'Arjun');
  };

  const preset = STAGE_PRESETS[selectedStage];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Minimal Hero Header */}
        <View style={styles.header}>
          <InteractiveAvatar mood="confident" size={72} />
          <Text style={styles.title}>Finance Simulator</Text>
          <Text style={styles.tagline}>
            Master real-world money decisions with zero capital risk.
          </Text>
        </View>

        {/* Character Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CHARACTER NAME</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Arjun"
            placeholderTextColor="#666666"
          />
        </View>

        {/* Starting Stage Pills */}
        <View style={styles.stageSection}>
          <Text style={styles.label}>STARTING LIFE STAGE</Text>
          <View style={styles.stagePillRow}>
            {stages.map((st) => {
              const info = STAGE_PRESETS[st];
              const isSelected = selectedStage === st;
              return (
                <TouchableOpacity
                  key={st}
                  activeOpacity={0.8}
                  style={[styles.stagePill, isSelected && styles.stagePillActive]}
                  onPress={() => setSelectedStage(st)}
                >
                  <Text style={[styles.stagePillText, isSelected && styles.stagePillTextActive]}>
                    {info.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Stage Live Preview (Clean Minimal Card) */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewStageTitle}>{preset.title}</Text>
            <Text style={styles.previewAgeText}>Age {preset.age}</Text>
          </View>
          <Text style={styles.previewDesc}>{preset.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Monthly Income</Text>
              <Text style={styles.statVal}>{formatINR(preset.monthlyIncome)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Starting Savings</Text>
              <Text style={styles.statVal}>{formatINR(preset.startingSavings)}</Text>
            </View>
          </View>

          <View style={[styles.statsRow, { marginTop: 10 }]}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Living Expenses</Text>
              <Text style={styles.statVal}>{formatINR(preset.fixedMonthlyExpenses)}/mo</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Starting Debt</Text>
              <Text style={styles.statVal}>{formatINR(preset.startingDebt)}</Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} activeOpacity={0.85} onPress={handleStart}>
          <Text style={styles.startButtonText}>Begin Simulation →</Text>
        </TouchableOpacity>

        {/* Educational Note */}
        <Text style={styles.footerNote}>
          100% virtual education simulator · No real money involved
        </Text>
      </ScrollView>
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 12,
  },
  tagline: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
  },
  stageSection: {
    marginBottom: 20,
  },
  stagePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stagePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  stagePillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
  },
  stagePillTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  previewCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewStageTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  previewAgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
  },
  previewDesc: {
    fontSize: 12,
    color: '#A3A3A3',
    lineHeight: 17,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
  footerNote: {
    fontSize: 11,
    color: '#555555',
    textAlign: 'center',
  },
});
