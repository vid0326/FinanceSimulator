/**
 * Onboarding Screen — "Build Your Financial Life"
 * Character creation, starting stage selection (Student, Intern, First Job), and goals setup.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
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
        {/* Header */}
        <View style={styles.header}>
          <InteractiveAvatar mood="confident" size={88} />
          <Text style={styles.title}>Finance Life Simulator</Text>
          <Text style={styles.tagline}>
            Learn to make real financial decisions without risking real money.
          </Text>
        </View>

        {/* Disclaimer Pill */}
        <View style={styles.disclaimerPill}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primaryLight} />
          <Text style={styles.disclaimerText}>
            100% Virtual Financial Life Simulation for Education
          </Text>
        </View>

        {/* Character Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Character’s Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Arjun"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Choose Starting Stage */}
        <View style={styles.stageSection}>
          <Text style={styles.label}>Choose Your Starting Life Stage</Text>
          <View style={styles.stageGrid}>
            {stages.map((st) => {
              const info = STAGE_PRESETS[st];
              const isSelected = selectedStage === st;
              return (
                <TouchableOpacity
                  key={st}
                  activeOpacity={0.8}
                  style={[styles.stageCard, isSelected && styles.stageCardSelected]}
                  onPress={() => setSelectedStage(st)}
                >
                  <View style={styles.stageCardHeader}>
                    <Text style={[styles.stageCardTitle, isSelected && styles.stageCardTitleSelected]}>
                      {info.title}
                    </Text>
                    <Text style={styles.stageCardAge}>Age {info.age}</Text>
                  </View>
                  <Text style={styles.stageCardIncome}>
                    Income: {formatINR(info.monthlyIncome)}/mo
                  </Text>
                  <Text style={styles.stageCardDesc} numberOfLines={2}>
                    {info.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Stage Live Preview */}
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Starting Financial State</Text>
          <View style={styles.previewGrid}>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Monthly Salary</Text>
              <Text style={[styles.previewVal, { color: colors.primary }]}>
                {formatINR(preset.monthlyIncome)}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Starting Savings</Text>
              <Text style={[styles.previewVal, { color: colors.text }]}>
                {formatINR(preset.startingSavings)}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Living Expenses</Text>
              <Text style={[styles.previewVal, { color: colors.textSecondary }]}>
                {formatINR(preset.fixedMonthlyExpenses)}/mo
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Existing Debt</Text>
              <Text style={[styles.previewVal, { color: colors.danger }]}>
                {formatINR(preset.startingDebt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} activeOpacity={0.85} onPress={handleStart}>
          <Text style={styles.startButtonText}>Begin Financial Life</Text>
          <Ionicons name="sparkles" size={18} color="#0B0F19" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  disclaimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryGlow,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  disclaimerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  stageSection: {
    marginBottom: 20,
  },
  stageGrid: {
    gap: 10,
  },
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  stageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  stageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  stageCardTitleSelected: {
    color: colors.primaryLight,
  },
  stageCardAge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  stageCardIncome: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  stageCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  previewBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  previewItem: {
    width: '45%',
  },
  previewLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  previewVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    color: '#0B0F19',
    fontSize: 17,
    fontWeight: '900',
  },
});
