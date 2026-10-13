/**
 * TimeMachineDial — Interactive Analog Future Scrubber
 * Scrub through ages 21 to 35 to watch the split-screen alternate realities evolve.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { formatINR } from './CurrencyText';

interface TimeMachineDialProps {
  currentAge: number;
  selectedAge: number;
  onAgeChange: (age: number) => void;
  baselineWealth: number;
  whatIfWealth: number;
}

export const TimeMachineDial: React.FC<TimeMachineDialProps> = ({
  currentAge,
  selectedAge,
  onAgeChange,
  baselineWealth,
  whatIfWealth,
}) => {
  const ageStops = [currentAge, currentAge + 2, currentAge + 5, currentAge + 8, currentAge + 12];

  const handleSelectAge = (age: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onAgeChange(age);
  };

  const wealthDifference = whatIfWealth - baselineWealth;

  return (
    <View style={styles.container}>
      {/* Time Machine Header */}
      <View style={styles.dialHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="speedometer-outline" size={18} color={colors.accent} />
          <Text style={styles.titleText}>TIME MACHINE: SCRUB TO AGE {selectedAge}</Text>
        </View>
        <Text style={styles.timeDiffText}>+{selectedAge - currentAge} Years in the Future</Text>
      </View>

      {/* Analog Age Scrub Buttons */}
      <View style={styles.scrubberRow}>
        {ageStops.map((age) => {
          const isSelected = selectedAge === age;
          return (
            <TouchableOpacity
              key={age}
              activeOpacity={0.75}
              style={[styles.dialPill, isSelected && styles.dialPillSelected]}
              onPress={() => handleSelectAge(age)}
            >
              <Text style={[styles.dialPillAge, isSelected && styles.dialPillAgeSelected]}>
                Age {age}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Split-Screen Alternate Reality Mirror */}
      <View style={styles.splitMirrorContainer}>
        {/* Reality A: Baseline */}
        <View style={styles.realitySide}>
          <Text style={styles.realitySideLabel}>REALITY A: BASELINE</Text>
          <Text style={styles.realityWealth}>{formatINR(baselineWealth, true)}</Text>
          <View style={styles.vibePill}>
            <Text style={styles.vibeText}>Standard Living</Text>
          </View>
        </View>

        {/* Divider VS badge */}
        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Reality B: What-If Compounding */}
        <View style={[styles.realitySide, styles.realitySideBoosted]}>
          <Text style={[styles.realitySideLabel, { color: colors.primaryLight }]}>
            REALITY B: WHAT-IF
          </Text>
          <Text style={[styles.realityWealth, { color: colors.primaryLight }]}>
            {formatINR(whatIfWealth, true)}
          </Text>
          <View style={[styles.vibePill, { backgroundColor: colors.primaryGlow }]}>
            <Text style={[styles.vibeText, { color: colors.primaryLight }]}>
              {wealthDifference >= 0 ? '+' : ''}{formatINR(wealthDifference, true)} Ahead!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    marginVertical: 12,
  },
  dialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  timeDiffText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  scrubberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 16,
  },
  dialPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dialPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  dialPillAge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  dialPillAgeSelected: {
    color: '#000000',
  },
  splitMirrorContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  realitySide: {
    flex: 1,
    alignItems: 'center',
  },
  realitySideBoosted: {
    borderLeftWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  realitySideLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  realityWealth: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
  },
  vibePill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  vibeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  vsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  vsText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.accent,
  },
});
