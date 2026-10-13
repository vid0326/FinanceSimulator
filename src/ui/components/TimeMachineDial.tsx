/**
 * TimeMachineDial — Minimalist Future Scrubber
 * Clean, distraction-free age slider with instant split-reality comparison.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
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
      {/* Age Scrubber Row */}
      <View style={styles.scrubberRow}>
        {ageStops.map((age) => {
          const isSelected = selectedAge === age;
          return (
            <TouchableOpacity
              key={age}
              activeOpacity={0.8}
              style={[styles.agePill, isSelected && styles.agePillActive]}
              onPress={() => handleSelectAge(age)}
            >
              <Text style={[styles.ageText, isSelected && styles.ageTextActive]}>
                Age {age}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Clean Split Reality Comparison */}
      <View style={styles.comparisonBox}>
        <View style={styles.col}>
          <Text style={styles.colLabel}>CURRENT PATH</Text>
          <Text style={styles.colAmount}>{formatINR(baselineWealth, true)}</Text>
        </View>

        <View style={styles.colDivider} />

        <View style={styles.col}>
          <Text style={styles.colLabel}>WHAT-IF PATH</Text>
          <Text style={styles.colAmountHighlight}>{formatINR(whatIfWealth, true)}</Text>
        </View>
      </View>

      {/* Difference Pill */}
      <View style={styles.diffBar}>
        <Text style={styles.diffText}>
          Net Impact at Age {selectedAge}:{' '}
          <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>
            {wealthDifference >= 0 ? '+' : ''}{formatINR(wealthDifference, true)}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginVertical: 10,
  },
  scrubberRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  agePill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#181818',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  agePillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  ageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
  },
  ageTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  comparisonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  colDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#262626',
  },
  colLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  colAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#A3A3A3',
  },
  colAmountHighlight: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  diffBar: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#1C1C1C',
    alignItems: 'center',
  },
  diffText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
});
